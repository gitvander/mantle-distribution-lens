/*
 * Incremental discovery for Merchant Moe Liquidity Book pools on Mantle.
 * Candidate events are never trusted by themselves: the LB Factory and the
 * pair contract must both resolve to the same official xStocks token route.
 */
const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "data", "catalog", "xstocks-mantle.json");
const RPC_POOL = path.join(ROOT, "data", "catalog", "rpc-pool.json");
const OUTPUT = path.join(ROOT, "data", "catalog", "merchant-moe-discovered-routes.json");
const CHECKPOINT = path.join(ROOT, "data", "catalog", "merchant-moe-factory-discovery-checkpoint.json");
const FACTORY = "0xa6630671775c4ea2743840f9a5016dcf2a104054";
const GET_LB_PAIR_INFORMATION = "0x704037bd";
const TOKEN_X = "0x05e8746d";
const TOKEN_Y = "0xda10610c";
const GET_RESERVES = "0x0902f1ac";
const DECIMALS = "0x313ce567";
const DEXSCREENER_PAIR = "https://api.dexscreener.com/latest/dex/pairs/mantle/";
const RECENT_BLOCKS = 250000;
const CHUNK = 10000;
const STABLES = new Set(["0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9", "0x779ded0c9e1022225f8e0630b35a9b54be713736"]);
let rpcUrls = [process.env.MANTLE_RPC_URL || "https://rpc.mantle.xyz"];
let rpcId = 0; let cursorRpc = 0;

const addr = (value) => typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value) ? value.toLowerCase() : "";
const topicAddr = (value) => value && value.length >= 42 ? `0x${value.slice(-40)}`.toLowerCase() : "";
const readWord = (value, index = 0) => BigInt(`0x${String(value || "").slice(2 + index * 64, 2 + (index + 1) * 64) || "0"}`);
const word = (value) => BigInt(value).toString(16).padStart(64, "0");
const addressWord = (value) => addr(value).slice(2).padStart(64, "0");
const hex = (value) => `0x${Number(value).toString(16)}`;
const pairInfoData = (x, y, binStep) => `${GET_LB_PAIR_INFORMATION}${addressWord(x)}${addressWord(y)}${word(binStep)}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function readJson(file) { return JSON.parse(await fs.readFile(file, "utf8")); }
async function writeJson(file, value) { await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8"); }

async function rpc(method, params) {
  let failure;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const offset = cursorRpc++ % rpcUrls.length;
    for (const url of rpcUrls.slice(offset).concat(rpcUrls.slice(0, offset))) {
      try {
        const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcId, method, params }), signal: AbortSignal.timeout(25000) });
        const body = await response.json();
        if (!response.ok || body.error) throw new Error(`${url}: ${body.error?.message || `HTTP ${response.status}`}`);
        return body.result;
      } catch (error) { failure = error; }
    }
    await sleep(400 * (attempt + 1));
  }
  throw failure || new Error("Merchant Moe RPC unavailable");
}
const call = (to, data) => rpc("eth_call", [{ to, data }, "latest"]);
async function decimals(token) { return Number(readWord(await call(token, DECIMALS))) || 18; }

async function priceUsd(pool) {
  try {
    const response = await fetch(`${DEXSCREENER_PAIR}${pool}`, { signal: AbortSignal.timeout(15000) });
    const body = await response.json();
    const pair = (body.pairs || []).find((item) => addr(item.pairAddress) === pool);
    const value = Number(pair?.priceUsd || 0);
    return Number.isFinite(value) && value > 0 ? { priceUsd: value, url: pair.url || `https://dexscreener.com/mantle/${pool}`, capturedAt: new Date().toISOString() } : null;
  } catch { return null; }
}

async function verify(log, officialTokens) {
  // LBPairCreated indexes pair, tokenX and tokenY; binStep is the first data word.
  if (!Array.isArray(log.topics) || log.topics.length !== 4 || !log.data || log.data.length < 66) return null;
  const pool = topicAddr(log.topics[1]); const tokenX = topicAddr(log.topics[2]); const tokenY = topicAddr(log.topics[3]);
  const binStep = Number(readWord(log.data, 0));
  const asset = officialTokens.get(tokenX) || officialTokens.get(tokenY);
  if (!pool || !tokenX || !tokenY || !binStep || !asset) return null;
  const factoryInfo = await call(FACTORY, pairInfoData(tokenX, tokenY, binStep));
  if (topicAddr(`0x${String(factoryInfo).slice(2 + 64, 2 + 128)}`) !== pool) return null;
  const [confirmedX, confirmedY, reserves] = await Promise.all([call(pool, TOKEN_X), call(pool, TOKEN_Y), call(pool, GET_RESERVES)]);
  if (topicAddr(confirmedX) !== tokenX || topicAddr(confirmedY) !== tokenY) return null;
  const stable = STABLES.has(tokenX) ? tokenX : STABLES.has(tokenY) ? tokenY : null;
  const observed = { pool, tokenX, tokenY, reserveX: readWord(reserves, 0).toString(), reserveY: readWord(reserves, 1).toString(), capturedAt: new Date().toISOString() };
  if (stable) {
    const [dx, dy, reference] = await Promise.all([decimals(tokenX), decimals(tokenY), priceUsd(pool)]);
    const amountX = Number(readWord(reserves, 0)) / 10 ** dx; const amountY = Number(readWord(reserves, 1)) / 10 ** dy;
    const stableAmount = stable === tokenX ? amountX : amountY;
    const assetAmount = tokenX === asset.address.toLowerCase() ? amountX : amountY;
    observed.stableAmount = stableAmount; observed.assetAmount = assetAmount; observed.priceReference = reference;
    observed.tvlUsd = reference ? stableAmount + assetAmount * reference.priceUsd : null;
  }
  return { assetId: asset.id, symbol: asset.symbol, name: asset.name, tokenA: asset.address.toLowerCase(), tokenB: tokenX === asset.address.toLowerCase() ? tokenY : tokenX, poolAddress: pool, binStep, venue: "Merchant Moe", url: `https://merchantmoe.com/pool/v22/${asset.address}/${tokenX === asset.address.toLowerCase() ? tokenY : tokenX}/${binStep}`, status: "verified_onchain", verifiedAt: new Date().toISOString(), discovery: "factory_event", verification: { status: "verified", method: "Merchant Moe LBFactory event + getLBPairInformation + pair token checks + getReserves().", lastObserved: observed } };
}

async function main() {
  const [catalog, config, previous, checkpoint] = await Promise.all([readJson(CATALOG), readJson(RPC_POOL), readJson(OUTPUT).catch(() => ({ routes: [] })), readJson(CHECKPOINT).catch(() => null)]);
  rpcUrls = (config.endpoints || []).filter((entry) => entry.enabled !== false).map((entry) => entry.url).filter(Boolean); if (!rpcUrls.length) rpcUrls = ["https://rpc.mantle.xyz"];
  const latest = Number(BigInt(await rpc("eth_blockNumber", [])));
  let next = checkpoint?.nextBlock || Math.max(0, latest - RECENT_BLOCKS);
  const officialTokens = new Map((catalog.assets || []).map((asset) => [asset.address.toLowerCase(), asset]));
  const routes = new Map((previous.routes || []).map((route) => [`${route.assetId}:${addr(route.poolAddress)}`, route]));
  let events = 0; let verified = 0;
  console.log(`Merchant Moe discovery: scanning recent blocks ${next}-${latest} in ${CHUNK.toLocaleString("en-US")}-block requests.`);
  while (next <= latest) {
    const end = Math.min(latest, next + CHUNK - 1);
    const logs = await rpc("eth_getLogs", [{ address: FACTORY, fromBlock: hex(next), toBlock: hex(end) }]);
    events += logs.length;
    for (const log of logs) {
      const route = await verify(log, officialTokens);
      if (route) { routes.set(`${route.assetId}:${addr(route.poolAddress)}`, route); verified += 1; }
    }
    next = end + 1;
    await writeJson(CHECKPOINT, { schema: 1, factory: FACTORY, nextBlock: next, lastScannedBlock: end, updatedAt: new Date().toISOString() });
  }
  const allRoutes = [...routes.values()].sort((a, b) => a.symbol.localeCompare(b.symbol));
  await writeJson(OUTPUT, { schema: 1, generatedAt: new Date().toISOString(), platform: "Merchant Moe", network: { name: "Mantle", chainId: 5000 }, scope: "Official xStocks Mantle base-token pools discovered through Merchant Moe Liquidity Book Factory events. USD TVL is shown only when the pair contains a recognized stablecoin and its exact pool price is available.", factory: FACTORY, routes: allRoutes });
  console.log(`Merchant Moe discovery complete: ${events} Factory event(s) scanned; ${verified} verified official xStocks route event(s); ${allRoutes.length} routes retained.`);
}
main().catch((error) => { console.error(`Merchant Moe discovery failed: ${error.message}`); process.exitCode = 1; });
