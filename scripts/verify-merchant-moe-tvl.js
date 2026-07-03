/* Read-only TVL verifier for Merchant Moe Liquidity Book pools on Mantle. */
const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ROUTES_FILE = path.join(ROOT, "data", "catalog", "merchant-moe-routes.json");
const RPC_POOL_FILE = path.join(ROOT, "data", "catalog", "rpc-pool.json");
const FACTORY = "0xa6630671775c4ea2743840f9a5016dcf2a104054";
const REAL_ID_SHIFT = 8_388_608;
// LBFactory V2.2 receives binStep as uint256 (not uint24).
const GET_LB_PAIR_INFORMATION = "0x704037bd";
const GET_RESERVES = "0x0902f1ac";
const GET_ACTIVE_ID = "0xdbe65edc";
const TOKEN_X = "0x05e8746d"; // getTokenX()
const TOKEN_Y = "0xda10610c"; // getTokenY()
const DECIMALS = "0x313ce567";
const BALANCE_OF = "0x70a08231";
const DEXSCREENER_PAIR_API = "https://api.dexscreener.com/latest/dex/pairs/mantle/";

function address(value) { return /^0x[a-fA-F0-9]{40}$/.test(String(value || "")) ? String(value).toLowerCase() : ""; }
function word(value) { return BigInt(value).toString(16).padStart(64, "0"); }
function addressWord(value) { return address(value).slice(2).padStart(64, "0"); }
function wordAt(value, index) { return BigInt(`0x${String(value || "0x").slice(2 + index * 64, 2 + (index + 1) * 64) || "0"}`); }
function addressAt(value, index) { const hex = String(value || "").slice(2 + index * 64, 2 + (index + 1) * 64); return hex ? `0x${hex.slice(-40)}`.toLowerCase() : ""; }
function units(raw, decimals) { return Number(raw) / (10 ** decimals); }

async function loadRpcUrls() {
  try {
    const pool = JSON.parse(await fs.readFile(RPC_POOL_FILE, "utf8"));
    const urls = (pool.endpoints || []).filter((item) => item.enabled !== false).map((item) => item.url).filter(Boolean);
    if (urls.length) return urls;
  } catch {}
  return ["https://rpc.mantle.xyz"];
}

async function rpc(urls, method, params) {
  const failures = [];
  for (const url of urls) {
    try {
      const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) });
      const body = await response.json();
      if (!response.ok || body.error) throw new Error(body.error?.message || `RPC failed: ${method}`);
      return { result: body.result, endpoint: url };
    } catch (error) { failures.push(`${url}: ${error.message}`); }
  }
  throw new Error(`No Merchant Moe RPC route is available (${failures.join(" | ") || "no endpoint configured"})`);
}

async function call(urls, to, data) { return (await rpc(urls, "eth_call", [{ to, data }, "latest"])).result; }
async function namedCall(urls, label, to, data) {
  try { return await call(urls, to, data); }
  catch (error) { throw new Error(`${label} failed: ${error.message}`); }
}
function encodePairInfo(tokenX, tokenY, binStep) { return `${GET_LB_PAIR_INFORMATION}${addressWord(tokenX)}${addressWord(tokenY)}${word(binStep)}`; }
function encodeBalanceOf(holder) { return `${BALANCE_OF}${addressWord(holder)}`; }

async function poolPriceUsd(pool) {
  const response = await fetch(`${DEXSCREENER_PAIR_API}${pool}`);
  if (!response.ok) throw new Error(`DexScreener price reference returned HTTP ${response.status}`);
  const payload = await response.json();
  const pair = (payload.pairs || []).find((item) => address(item.pairAddress) === pool);
  const priceUsd = Number(pair?.priceUsd || 0);
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) throw new Error("DexScreener did not return a usable USD price for the exact Merchant Moe pool");
  return { priceUsd, pairAddress: pool, url: pair.url || `https://dexscreener.com/mantle/${pool}`, capturedAt: new Date().toISOString() };
}

async function verifyRoute(route, urls) {
  const tokenA = address(route.tokenA); const tokenB = address(route.tokenB);
  const recordedPool = address(route.poolAddress);
  const info = recordedPool ? null : await call(urls, FACTORY, encodePairInfo(tokenA, tokenB, route.binStep));
  const pool = recordedPool || addressAt(info, 1);
  if (!pool) throw new Error("LB Factory did not return a pool address for this pair and bin step");
  const tokenX = addressAt(await namedCall(urls, "Pool getTokenX()", pool, TOKEN_X), 0);
  const tokenY = addressAt(await namedCall(urls, "Pool getTokenY()", pool, TOKEN_Y), 0);
  const reserveResult = await namedCall(urls, "Pool getReserves()", pool, GET_RESERVES);
  const activeResult = await namedCall(urls, "Pool getActiveId()", pool, GET_ACTIVE_ID);
  if ([tokenX, tokenY].sort().join(",") !== [tokenA, tokenB].sort().join(",")) throw new Error("Pool tokens do not match the recorded Merchant Moe route");
  const decX = await namedCall(urls, "tokenX decimals()", tokenX, DECIMALS);
  const decY = await namedCall(urls, "tokenY decimals()", tokenY, DECIMALS);
  const reserveX = wordAt(reserveResult, 0); const reserveY = wordAt(reserveResult, 1);
  const activeId = Number(wordAt(activeResult, 0));
  const stable = tokenX === tokenB ? "y" : tokenY === tokenB ? "x" : null;
  if (!stable) throw new Error("The recorded stablecoin does not match the Merchant Moe pool tokens");
  const xAmount = units(reserveX, Number(wordAt(decX, 0)) || 18);
  const yAmount = units(reserveY, Number(wordAt(decY, 0)) || 18);
  const priceReference = await poolPriceUsd(pool);
  const assetAmount = tokenX === tokenA ? xAmount : yAmount;
  const stableAmount = tokenX === tokenB ? xAmount : yAmount;
  const tvlUsd = stableAmount + assetAmount * priceReference.priceUsd;
  if (!Number.isFinite(tvlUsd) || tvlUsd < 0 || tvlUsd > 1e12) throw new Error("Calculated TVL is outside the accepted verification range");
  return { pool, tokenX, tokenY, activeId, binStep: Number(route.binStep), reserveX: reserveX.toString(), reserveY: reserveY.toString(), assetAmount, stableAmount, priceReference, tvlUsd, capturedAt: new Date().toISOString(), method: recordedPool ? "Exact Merchant Moe pool contract getReserves(), valued with the USD price reference for that same pool. Reserves are read-only onchain data; the price reference does not supply liquidity." : "LB Factory -> LB Pair getReserves(), valued with the USD price reference for that same pool." };
}

async function main() {
  const [routes, urls] = await Promise.all([fs.readFile(ROUTES_FILE, "utf8").then(JSON.parse), loadRpcUrls()]);
  console.log(`Merchant Moe verifier using RPC pool: ${urls.join(", ")}`);
  for (const route of routes.routes || []) {
    try {
      route.verification = { status: "verified", lastObserved: await verifyRoute(route, urls) };
      console.log(`${route.symbol}: Merchant Moe TVL verified`);
    } catch (error) {
      route.verification = { status: "pending", lastError: error.message, lastAttemptAt: new Date().toISOString() };
      console.warn(`${route.symbol}: Merchant Moe TVL pending - ${error.message}`);
    }
  }
  routes.updatedAt = new Date().toISOString();
  await fs.writeFile(ROUTES_FILE, `${JSON.stringify(routes, null, 2)}\n`, "utf8");
}

main().catch((error) => { console.error(`Merchant Moe TVL verification failed: ${error.message}`); process.exitCode = 1; });
