/*
 * Finds live Fluxion RWA pools without trusting a front-end list.
 *
 * Scope: official xStocks Mantle deployments and their ERC-4626 wrappers,
 * paired with Fluxion's onchain USDC route at the current RWA fee convention
 * (0.30%). A detected pool is still verified for tokens, wrapper underlying,
 * factory resolution, balances and slot0 before it is written as evidence.
 */
const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CATALOG_FILE = path.join(ROOT, "data", "catalog", "xstocks-mantle.json");
const RPC_POOL_FILE = path.join(ROOT, "data", "catalog", "rpc-pool.json");
const OUTPUT_FILE = path.join(ROOT, "data", "catalog", "fluxion-discovered-routes.json");
const FACTORY = "0xf883162ed9c7e8ef604214c964c678e40c9b737c";
const USDC = "0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9";
const FEE = 3000;
const GET_POOL = "0x1698ee82";
const BALANCE_OF = "0x70a08231";
const WORKERS = 3;
let rpcUrls = [process.env.MANTLE_RPC_URL || "https://rpc.mantle.xyz"];
let rpcId = 0;
let rpcCursor = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normalizeAddress = (value) => typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value) ? value.toLowerCase() : "";
const readAddress = (value) => value && value.length >= 42 ? `0x${value.slice(-40)}`.toLowerCase() : "";
const readWord = (value, index = 0) => BigInt(`0x${String(value || "").slice(2 + index * 64, 2 + (index + 1) * 64) || "0"}`);
const word = (value) => BigInt(value).toString(16).padStart(64, "0");
const addressWord = (address) => normalizeAddress(address).slice(2).padStart(64, "0");
const encodeGetPool = (left, right, fee) => `${GET_POOL}${addressWord(left)}${addressWord(right)}${word(fee)}`;
const encodeBalanceOf = (holder) => `${BALANCE_OF}${addressWord(holder)}`;

async function readJson(file) { return JSON.parse(await fs.readFile(file, "utf8")); }
async function writeJson(file, value) { await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8"); }

async function loadRpcUrls() {
  try {
    const pool = await readJson(RPC_POOL_FILE);
    const urls = (pool.endpoints || []).filter((endpoint) => endpoint.enabled !== false).map((endpoint) => endpoint.url).filter(Boolean);
    if (urls.length) return urls;
  } catch {}
  return rpcUrls;
}

async function rpc(method, params) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const offset = rpcCursor++ % rpcUrls.length;
    const plan = rpcUrls.slice(offset).concat(rpcUrls.slice(0, offset));
    for (const url of plan) {
      try {
        const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcId, method, params }) });
        const payload = await response.json();
        if (!response.ok || payload.error) throw new Error(`${url}: ${payload.error?.message || `HTTP ${response.status}`}`);
        return payload.result;
      } catch (error) { lastError = error; }
    }
    if (attempt < 2) await sleep(500 * (attempt + 1));
  }
  throw lastError || new Error("No Mantle RPC endpoint returned a result");
}

const call = (to, data) => rpc("eth_call", [{ to, data }, "latest"]);
async function decimals(token) { return Number(readWord(await call(token, "0x313ce567"))) || 18; }

async function inspect(asset, wrapper) {
  const pool = readAddress(await call(FACTORY, encodeGetPool(USDC, wrapper, FEE)));
  if (!pool || /^0x0{40}$/.test(pool)) return null;
  const [code, token0Raw, token1Raw, feeRaw, underlyingRaw, slot0Raw] = await Promise.all([
    rpc("eth_getCode", [pool, "latest"]), call(pool, "0x0dfe1681"), call(pool, "0xd21220a7"), call(pool, "0xddca3f43"), call(wrapper, "0x38d52e0f"), call(pool, "0x3850c7bd"),
  ]);
  const token0 = readAddress(token0Raw);
  const token1 = readAddress(token1Raw);
  const underlying = readAddress(underlyingRaw);
  const expectedTokens = [USDC, wrapper].sort().join(",");
  if (!code || code === "0x") throw new Error("Factory returned a pool without bytecode");
  if ([token0, token1].sort().join(",") !== expectedTokens) throw new Error("Pool tokens do not match USDC and the official wrapper");
  if (Number(readWord(feeRaw)) !== FEE) throw new Error("Pool fee does not match the discovered route");
  if (underlying !== normalizeAddress(asset.address)) throw new Error("Wrapper asset() does not resolve to this official xStock");

  const [token0Decimals, token1Decimals, balance0Raw, balance1Raw] = await Promise.all([
    decimals(token0), decimals(token1), call(token0, encodeBalanceOf(pool)), call(token1, encodeBalanceOf(pool)),
  ]);
  const amount0 = Number(readWord(balance0Raw)) / 10 ** token0Decimals;
  const amount1 = Number(readWord(balance1Raw)) / 10 ** token1Decimals;
  const quoteIsToken0 = token0 === USDC;
  const sqrtPriceX96 = readWord(slot0Raw);
  const rawToken1PerToken0 = Math.pow(Number(sqrtPriceX96) / Math.pow(2, 96), 2);
  const humanToken1PerToken0 = rawToken1PerToken0 * Math.pow(10, token0Decimals - token1Decimals);
  const wrapperAmount = quoteIsToken0 ? amount1 : amount0;
  const stableAmount = quoteIsToken0 ? amount0 : amount1;
  const priceUsdPerWrapper = quoteIsToken0 ? 1 / humanToken1PerToken0 : humanToken1PerToken0;
  const poolTvlUsd = stableAmount + wrapperAmount * priceUsdPerWrapper;
  const safeTvl = Number.isFinite(poolTvlUsd) && poolTvlUsd >= 0 && poolTvlUsd <= 1e12 ? poolTvlUsd : null;
  return {
    assetId: asset.id, symbol: asset.symbol, name: asset.name, underlying: normalizeAddress(asset.address), wrapper, pool, fee: FEE,
    url: `https://fluxion.network/pool/${pool}`,
    status: "verified_onchain",
    verifiedAt: new Date().toISOString(),
    verification: {
      factory: FACTORY, quoteToken: USDC, method: "Fluxion Factory getPool + pool token checks + ERC-4626 asset() + onchain balances and slot0.",
      lastObserved: { poolTvlUsd: safeTvl, poolTvlCapturedAt: new Date().toISOString(), token0, token1, token0Amount: amount0, token1Amount: amount1, stableAmount, wrapperAmount, priceUsdPerWrapper }
    }
  };
}

async function runWorkers(items, handler) {
  const queue = [...items]; const results = [];
  async function worker() { while (queue.length) { const item = queue.shift(); if (!item) return; results.push(await handler(item)); } }
  await Promise.all(Array.from({ length: Math.min(WORKERS, items.length) }, worker));
  return results;
}

async function main() {
  const [catalog, urls, previous] = await Promise.all([
    readJson(CATALOG_FILE), loadRpcUrls(), readJson(OUTPUT_FILE).catch(() => ({ routes: [] })),
  ]);
  rpcUrls = urls;
  const candidates = (catalog.assets || []).flatMap((asset) => (asset.wrappers || []).filter((wrapper) => wrapper.type === "ERC4626").map((wrapper) => ({ asset, wrapper: normalizeAddress(wrapper.address) }))).filter((item) => item.wrapper);
  console.log(`Fluxion discovery: checking ${candidates.length} official xStocks wrappers against the USDC / 0.30% RWA route.`);
  const examined = await runWorkers(candidates, async ({ asset, wrapper }) => {
    try { return { asset, wrapper, route: await inspect(asset, wrapper), error: null }; }
    catch (error) { return { asset, wrapper, route: null, error: error.message }; }
  });
  const failed = examined.filter((item) => item.error);
  const successful = examined.filter((item) => !item.error);
  if (!successful.length) throw new Error(`No RPC checks completed successfully. Existing discovery data was preserved. Last error: ${failed[0]?.error || "unknown"}`);
  const routesByWrapper = new Map((previous.routes || []).map((route) => [normalizeAddress(route.wrapper), route]));
  for (const item of successful) {
    if (item.route) routesByWrapper.set(item.wrapper, item.route);
    else if (routesByWrapper.get(item.wrapper)?.verification?.quoteToken === USDC && Number(routesByWrapper.get(item.wrapper)?.fee) === FEE) routesByWrapper.delete(item.wrapper);
  }
  const routes = [...routesByWrapper.values()].sort((left, right) => left.symbol.localeCompare(right.symbol));
  await writeJson(OUTPUT_FILE, {
    schema: 1, generatedAt: new Date().toISOString(), platform: "Fluxion", network: { name: "Mantle", chainId: 5000 },
    scope: "Official xStocks Mantle ERC-4626 wrappers paired with Fluxion USDC at the 0.30% RWA fee tier. Other tokens, quote assets, or fee tiers are intentionally not claimed as covered.",
    factory: FACTORY, quoteToken: USDC, fee: FEE, routes,
  });
  console.log(`Fluxion discovery complete: ${routes.length} verified official RWA pool(s) found; ${successful.length}/${candidates.length} wrappers checked successfully.`);
  if (failed.length) console.warn(`${failed.length} wrapper check(s) could not reach the public RPC. Prior verified routes for those wrappers were preserved.`);
  for (const route of routes) console.log(`  ${route.symbol}: ${route.pool} · ${route.verification.lastObserved.poolTvlUsd || 0} USD TVL`);
}

main().catch((error) => { console.error(`Fluxion discovery failed: ${error.message}`); process.exitCode = 1; });
