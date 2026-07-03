/*
 * Checks the reviewed Fluxion liquidity basket directly on Mantle.
 * The TVL snapshot is deliberately not recomputed here: V3 liquidity units
 * are not USD values without a separate, reviewable price methodology.
 */
const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "data", "catalog", "fluxion-liquidity-basket.json");
const DIRECT_ROUTES_FILE = path.join(ROOT, "data", "catalog", "fluxion-direct-routes.json");
const RPC_POOL_FILE = path.join(ROOT, "data", "catalog", "rpc-pool.json");
const FACTORY = "0xf883162ed9c7e8ef604214c964c678e40c9b737c";
const QUOTER_V2 = "0x3e4ee18ac7280813236a1eb850679da5322e14ce";
const GET_POOL = "0x1698ee82"; // getPool(address,address,uint24)
const QUOTE_EXACT_INPUT_SINGLE = "0xc6a5026a"; // quoteExactInputSingle((address,address,uint256,uint24,uint160))
const BALANCE_OF = "0x70a08231";
let rpcId = 0;
let rpcUrls = [process.env.MANTLE_RPC_URL || "https://rpc.mantle.xyz"];

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function normalizeAddress(value) {
  return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value) ? value.toLowerCase() : "";
}

function readAddress(value) {
  return value && value.length >= 42 ? `0x${value.slice(-40)}`.toLowerCase() : "";
}

function readUint(value) {
  try { return BigInt(value).toString(); } catch { return "0"; }
}

function word(value) { return BigInt(value).toString(16).padStart(64, "0"); }
function addressWord(value) { return normalizeAddress(value).slice(2).padStart(64, "0"); }
function readWord(value, index = 0) { return BigInt(`0x${String(value || "").slice(2 + (index * 64), 2 + ((index + 1) * 64)) || "0"}`); }
function encodeBalanceOf(holder) { return `${BALANCE_OF}${addressWord(holder)}`; }

function encodeGetPool(tokenA, tokenB, fee) {
  return `${GET_POOL}${addressWord(tokenA)}${addressWord(tokenB)}${word(fee)}`;
}

function encodeQuoteExactInputSingle(tokenIn, tokenOut, amountIn, fee) {
  return `${QUOTE_EXACT_INPUT_SINGLE}${addressWord(tokenIn)}${addressWord(tokenOut)}${word(amountIn)}${word(fee)}${word(0)}`;
}

async function rpc(method, params) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    for (const url of rpcUrls) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcId, method, params }),
        });
        if (!response.ok) {
          lastError = new Error(`${url}: Mantle RPC returned HTTP ${response.status}`);
          continue;
        }
        const payload = await response.json();
        if (payload.error) throw new Error(`${url}: ${payload.error.message || "Mantle RPC error"}`);
        return payload.result;
      } catch (error) {
        lastError = error;
      }
    }
    if (attempt < 2) await sleep(750 * (attempt + 1));
  }
  throw lastError || new Error("Mantle RPC did not return a result");
}

async function loadRpcUrls() {
  try {
    const pool = JSON.parse(await fs.readFile(RPC_POOL_FILE, "utf8"));
    const urls = (pool.endpoints || []).filter((item) => item.enabled !== false).map((item) => item.url).filter(Boolean);
    if (urls.length) return urls;
  } catch {}
  return rpcUrls;
}

async function call(address, data) {
  return rpc("eth_call", [{ to: address, data }, "latest"]);
}

async function tokenDecimals(address) {
  return Number(readUint(await call(address, "0x313ce567"))) || 18;
}

async function quoteBuyUsdc(wrapper, fee, amountIn) {
  const raw = await call(QUOTER_V2, encodeQuoteExactInputSingle("0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9", wrapper, amountIn, fee));
  const amountOut = readWord(raw, 0);
  const ticksCrossed = Number(readWord(raw, 2));
  return { amountInUsdc: Number(amountIn) / 1e6, amountOutRaw: amountOut.toString(), initializedTicksCrossed: ticksCrossed };
}

async function verify(asset, basket) {
  const pool = normalizeAddress(asset.pool);
  const code = await rpc("eth_getCode", [pool, "latest"]);
  const token0 = await call(pool, "0x0dfe1681"); // token0()
  const token1 = await call(pool, "0xd21220a7"); // token1()
  const fee = await call(pool, "0xddca3f43"); // fee()
  const liquidity = await call(pool, "0x1a686502"); // liquidity()
  const slot0 = await call(pool, "0x3850c7bd"); // slot0()
  const underlying = await call(asset.wrapper, "0x38d52e0f"); // ERC-4626 asset()
  const factoryPool = readAddress(await call(FACTORY, encodeGetPool(basket.selection.quoteToken.address, asset.wrapper, basket.selection.fee)));
  if (!code || code === "0x") throw new Error("Pool bytecode not found on Mantle");
  const tokens = [readAddress(token0), readAddress(token1)].sort();
  const expected = [normalizeAddress(basket.selection.quoteToken.address), normalizeAddress(asset.wrapper)].sort();
  if (tokens.join(",") !== expected.join(",")) throw new Error("Pool tokens no longer match the reviewed pair");
  if (Number(readUint(fee)) !== Number(basket.selection.fee)) throw new Error("Pool fee no longer matches the reviewed tier");
  if (readAddress(underlying) !== normalizeAddress(asset.address)) throw new Error("Wrapper asset() no longer resolves to the reviewed xStock");
  if (factoryPool !== pool) throw new Error("Fluxion Factory getPool() does not resolve to the reviewed pool");
  const wrapperDecimals = await tokenDecimals(asset.wrapper);
  const token0Address = readAddress(token0);
  const token1Address = readAddress(token1);
  const [token0Decimals, token1Decimals, balance0Raw, balance1Raw] = await Promise.all([
    tokenDecimals(token0Address), tokenDecimals(token1Address),
    call(token0Address, encodeBalanceOf(pool)), call(token1Address, encodeBalanceOf(pool)),
  ]);
  const quoteToken = normalizeAddress(basket.selection.quoteToken.address);
  const quoteIsToken0 = token0Address === quoteToken;
  const quoteIsToken1 = token1Address === quoteToken;
  if (!quoteIsToken0 && !quoteIsToken1) throw new Error("Reviewed Fluxion pool does not contain the configured USDC quote token");
  const sqrtPriceX96 = readWord(slot0, 0);
  const rawToken1PerToken0 = Math.pow(Number(sqrtPriceX96) / Math.pow(2, 96), 2);
  const humanToken1PerToken0 = rawToken1PerToken0 * Math.pow(10, token0Decimals - token1Decimals);
  const token0Amount = Number(readUint(balance0Raw)) / Math.pow(10, token0Decimals);
  const token1Amount = Number(readUint(balance1Raw)) / Math.pow(10, token1Decimals);
  const wrapperAmount = quoteIsToken0 ? token1Amount : token0Amount;
  const stableAmount = quoteIsToken0 ? token0Amount : token1Amount;
  const priceUsdPerWrapper = quoteIsToken0 ? 1 / humanToken1PerToken0 : humanToken1PerToken0;
  const poolTvlUsd = stableAmount + (wrapperAmount * priceUsdPerWrapper);
  if (!Number.isFinite(poolTvlUsd) || poolTvlUsd <= 0 || poolTvlUsd > 1e12) throw new Error("Fluxion onchain pool TVL is outside the accepted range");
  const quote100 = await quoteBuyUsdc(asset.wrapper, Number(basket.selection.fee), 100000000n);
  const quote1000 = await quoteBuyUsdc(asset.wrapper, Number(basket.selection.fee), 1000000000n);
  const units100 = Number(quote100.amountOutRaw) / (10 ** wrapperDecimals);
  const units1000 = Number(quote1000.amountOutRaw) / (10 ** wrapperDecimals);
  const price100 = units100 > 0 ? 100 / units100 : null;
  const price1000 = units1000 > 0 ? 1000 / units1000 : null;
  return {
    pool,
    token0: token0Address,
    token1: token1Address,
    fee: Number(readUint(fee)),
    activeLiquidityUnits: readUint(liquidity),
    slot0Available: Boolean(slot0 && slot0 !== "0x"),
    underlying: readAddress(underlying),
    factoryPool,
    poolTvlUsd,
    poolTvlCapturedAt: new Date().toISOString(),
    poolReserves: { token0Amount, token1Amount, stableAmount, wrapperAmount, priceUsdPerWrapper, method: "ERC-20 balances held by the Fluxion V3 pool, valued using the pool slot0 price." },
    quoteSimulation: {
      method: "Fluxion QuoterV2 quoteExactInputSingle; eth_call only, no trade is executed.",
      capturedAt: new Date().toISOString(),
      quoteToken: basket.selection.quoteToken.address.toLowerCase(),
      quoteTokenSymbol: "USDC",
      wrapperDecimals,
      buy100Usd: { ...quote100, wrapperOut: units100, impliedUsdPerWrapper: price100 },
      buy1000Usd: { ...quote1000, wrapperOut: units1000, impliedUsdPerWrapper: price1000 },
      largerTradePriceImpactPercent: price100 && price1000 ? ((price1000 / price100) - 1) * 100 : null,
    }
  };
}

async function main() {
  const [basket, directRoutes, loadedRpcUrls] = await Promise.all([
    fs.readFile(FILE, "utf8").then(JSON.parse),
    fs.readFile(DIRECT_ROUTES_FILE, "utf8").then(JSON.parse),
    loadRpcUrls(),
  ]);
  rpcUrls = loadedRpcUrls;
  console.log(`Fluxion verifier using RPC pool: ${rpcUrls.join(", ")}`);
  let failures = 0;
  for (const asset of basket.assets || []) {
    const attemptedAt = new Date().toISOString();
    try {
      const observed = await verify(asset, basket);
      asset.lastCheckedAt = attemptedAt;
      asset.lastAttemptAt = attemptedAt;
      asset.verification = { ...asset.verification, lastResult: "pass", lastObserved: observed };
      delete asset.verification.lastError;
      console.log(`${asset.symbol}: Fluxion route verified`);
    } catch (error) {
      failures += 1;
      asset.lastAttemptAt = attemptedAt;
      asset.verification = { ...asset.verification, lastResult: "failed", lastError: error.message };
      console.warn(`${asset.symbol}: Fluxion route failed — ${error.message}`);
    }
  }
  for (const route of directRoutes.routes || []) {
    const attemptedAt = new Date().toISOString();
    try {
      const observed = await verify(route, directRoutes);
      route.lastCheckedAt = attemptedAt;
      route.lastAttemptAt = attemptedAt;
      route.verification = { ...route.verification, lastResult: "pass", lastObserved: observed };
      delete route.verification.lastError;
      console.log(`${route.symbol}: Fluxion direct route verified`);
    } catch (error) {
      failures += 1;
      route.lastAttemptAt = attemptedAt;
      route.verification = { ...route.verification, lastResult: "failed", lastError: error.message };
      console.warn(`${route.symbol}: Fluxion direct route failed â€” ${error.message}`);
    }
  }
  basket.updatedAt = new Date().toISOString();
  directRoutes.updatedAt = new Date().toISOString();
  await fs.writeFile(FILE, `${JSON.stringify(basket, null, 2)}\n`, "utf8");
  await fs.writeFile(DIRECT_ROUTES_FILE, `${JSON.stringify(directRoutes, null, 2)}\n`, "utf8");
  if (failures) {
    console.warn(`Fluxion verification finished with ${failures} route failure(s).`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Fluxion basket verification failed: ${error.message}`);
  process.exitCode = 1;
});
