/*
 * Incremental Fluxion Factory discovery.
 * It reads the Factory's emitted logs instead of assuming a quote token or fee.
 * A route is published only after the emitted pool is verified onchain and one
 * side resolves to an official xStocks Mantle ERC-4626 wrapper.
 */
const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CATALOG_FILE = path.join(ROOT, "data", "catalog", "xstocks-mantle.json");
const RPC_POOL_FILE = path.join(ROOT, "data", "catalog", "rpc-pool.json");
const OUTPUT_FILE = path.join(ROOT, "data", "catalog", "fluxion-discovered-routes.json");
const CHECKPOINT_FILE = path.join(ROOT, "data", "catalog", "fluxion-factory-discovery-checkpoint.json");
const FACTORY = "0xf883162ed9c7e8ef604214c964c678e40c9b737c";
const USDC = "0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9";
const GET_POOL = "0x1698ee82";
const BALANCE_OF = "0x70a08231";
// Every configured public RPC accepts this conservative log range. The initial
// lookback is intentionally short: it detects newly created pools promptly
// without turning the 15-minute market refresh into a historical backfill.
const INITIAL_LOOKBACK = Math.max(10_000, Number(process.env.FLUXION_FACTORY_RECENT_BLOCKS || 250_000));
const CHUNK = 10_000;
let rpcUrls = [process.env.MANTLE_RPC_URL || "https://rpc.mantle.xyz"];
let rpcId = 0;
let rpcCursor = 0;

const normalize = (value) => typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value) ? value.toLowerCase() : "";
const address = (value) => value && value.length >= 42 ? `0x${value.slice(-40)}`.toLowerCase() : "";
const word = (value) => BigInt(value).toString(16).padStart(64, "0");
const addressWord = (value) => normalize(value).slice(2).padStart(64, "0");
const readWord = (value, index = 0) => BigInt(`0x${String(value || "").slice(2 + index * 64, 2 + (index + 1) * 64) || "0"}`);
const hex = (value) => `0x${Number(value).toString(16)}`;
const encodeGetPool = (a, b, fee) => `${GET_POOL}${addressWord(a)}${addressWord(b)}${word(fee)}`;
const encodeBalanceOf = (holder) => `${BALANCE_OF}${addressWord(holder)}`;
async function readJson(file) { return JSON.parse(await fs.readFile(file, "utf8")); }
async function writeJson(file, value) { await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8"); }

async function loadRpcUrls() {
  try { const config = await readJson(RPC_POOL_FILE); const urls = (config.endpoints || []).filter((entry) => entry.enabled !== false).map((entry) => entry.url).filter(Boolean); if (urls.length) return urls; } catch {}
  return rpcUrls;
}
async function rpc(method, params) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const offset = rpcCursor++ % rpcUrls.length;
    for (const url of rpcUrls.slice(offset).concat(rpcUrls.slice(0, offset))) {
      try {
        const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcId, method, params }) });
        const body = await response.json();
        if (!response.ok || body.error) throw new Error(`${url}: ${body.error?.message || `HTTP ${response.status}`}`);
        return body.result;
      } catch (error) { lastError = error; }
    }
  }
  throw lastError || new Error("Mantle RPC unavailable");
}
const call = (to, data) => rpc("eth_call", [{ to, data }, "latest"]);
async function decimals(token) { return Number(readWord(await call(token, "0x313ce567"))) || 18; }

async function measure(pool, token0, token1, wrapper) {
  if (![token0, token1].includes(USDC)) return { poolTvlUsd: null, poolTvlCapturedAt: new Date().toISOString() };
  const [slot0, d0, d1, b0, b1] = await Promise.all([call(pool, "0x3850c7bd"), decimals(token0), decimals(token1), call(token0, encodeBalanceOf(pool)), call(token1, encodeBalanceOf(pool))]);
  const amount0 = Number(readWord(b0)) / 10 ** d0;
  const amount1 = Number(readWord(b1)) / 10 ** d1;
  const quoteIs0 = token0 === USDC;
  const raw = Math.pow(Number(readWord(slot0)) / Math.pow(2, 96), 2);
  const human = raw * Math.pow(10, d0 - d1);
  const price = quoteIs0 ? 1 / human : human;
  const tvl = (quoteIs0 ? amount0 : amount1) + (quoteIs0 ? amount1 : amount0) * price;
  return { poolTvlUsd: Number.isFinite(tvl) && tvl >= 0 && tvl <= 1e12 ? tvl : null, poolTvlCapturedAt: new Date().toISOString(), token0Amount: amount0, token1Amount: amount1, priceUsdPerWrapper: price };
}

async function verifyLog(log, wrapperMap) {
  if (!Array.isArray(log.topics) || log.topics.length !== 4 || !log.data || log.data.length < 130) return [];
  const token0 = address(log.topics[1]); const token1 = address(log.topics[2]); const fee = Number(BigInt(log.topics[3])); const pool = address(log.data);
  if (!token0 || !token1 || !pool || !fee) return [];
  const matches = [token0, token1].filter((token) => wrapperMap.has(token));
  if (!matches.length) return [];
  const factoryPool = address(await call(FACTORY, encodeGetPool(token0, token1, fee)));
  if (factoryPool !== pool) return [];
  const results = [];
  for (const wrapper of matches) {
    const asset = wrapperMap.get(wrapper);
    const [poolToken0, poolToken1, underlying] = await Promise.all([call(pool, "0x0dfe1681"), call(pool, "0xd21220a7"), call(wrapper, "0x38d52e0f")]);
    if (address(poolToken0) !== token0 || address(poolToken1) !== token1 || address(underlying) !== normalize(asset.address)) continue;
    results.push({ assetId: asset.id, symbol: asset.symbol, name: asset.name, underlying: normalize(asset.address), wrapper, pool, fee, quoteToken: wrapper === token0 ? token1 : token0,
      url: `https://fluxion.network/pool/${pool}`, status: "verified_onchain", verifiedAt: new Date().toISOString(), discovery: "factory_event",
      verification: { factory: FACTORY, method: "Fluxion Factory event + getPool + pool token checks + ERC-4626 asset().", lastObserved: await measure(pool, token0, token1, wrapper) } });
  }
  return results;
}

async function main() {
  const [catalog, urls, previous, checkpoint] = await Promise.all([readJson(CATALOG_FILE), loadRpcUrls(), readJson(OUTPUT_FILE).catch(() => ({ routes: [] })), readJson(CHECKPOINT_FILE).catch(() => null)]);
  rpcUrls = urls;
  const latest = Number(BigInt(await rpc("eth_blockNumber", [])));
  let cursor = checkpoint?.nextBlock || Math.max(0, latest - INITIAL_LOOKBACK);
  const wrapperMap = new Map((catalog.assets || []).flatMap((asset) => (asset.wrappers || []).map((wrapper) => [normalize(wrapper.address), asset])));
  const routes = new Map((previous.routes || []).map((route) => [`${route.assetId}:${normalize(route.pool)}`, route]));
  console.log(`Fluxion Factory discovery: scanning recent blocks ${cursor}-${latest} in ${CHUNK.toLocaleString("en-US")}-block requests.`);
  let events = 0; let found = 0;
  while (cursor <= latest) {
    const end = Math.min(latest, cursor + CHUNK - 1);
    const logs = await rpc("eth_getLogs", [{ address: FACTORY, fromBlock: hex(cursor), toBlock: hex(end) }]);
    events += logs.length;
    for (const log of logs) for (const route of await verifyLog(log, wrapperMap)) { routes.set(`${route.assetId}:${route.pool}`, route); found += 1; }
    cursor = end + 1;
    await writeJson(CHECKPOINT_FILE, { schema: 1, factory: FACTORY, nextBlock: cursor, lastScannedBlock: end, updatedAt: new Date().toISOString() });
  }
  const allRoutes = [...routes.values()].sort((a, b) => a.symbol.localeCompare(b.symbol));
  await writeJson(OUTPUT_FILE, { schema: 1, generatedAt: new Date().toISOString(), platform: "Fluxion", network: { name: "Mantle", chainId: 5000 }, scope: "Official xStocks Mantle wrappers discovered through incremental Fluxion Factory event scanning. Any pool without an official wrapper is deliberately excluded.", factory: FACTORY, routes: allRoutes });
  console.log(`Fluxion Factory discovery complete: ${events} Factory event(s) scanned; ${found} verified route event(s); ${allRoutes.length} routes retained.`);
}
main().catch((error) => { console.error(`Fluxion Factory discovery failed: ${error.message}`); process.exitCode = 1; });
