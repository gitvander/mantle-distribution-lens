/*
 * Verifies the curated market routes referenced by research profiles.
 *
 * This script intentionally verifies only explicit, reviewed contracts and
 * public pairs. It does not discover or score new venues automatically.
 * A failed check never silently turns into a new score or a guessed market.
 */
const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const REGISTRY_FILE = path.join(ROOT, "data", "registry.json");
const RPC_URL = process.env.MANTLE_RPC_URL || "https://rpc.mantle.xyz";
const DEX_PAIR_URL = "https://api.dexscreener.com/latest/dex/pairs/mantle/";
let rpcId = 0;

function normalizeAddress(value) {
  return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value) ? value.toLowerCase() : "";
}

function sameAddress(left, right) {
  return normalizeAddress(left) === normalizeAddress(right);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function rpc(method, params) {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcId, method, params }),
  });
  if (!response.ok) throw new Error(`Mantle RPC returned HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message || "Mantle RPC error");
  return payload.result;
}

function readAddress(result) {
  return typeof result === "string" && result.length >= 42 ? `0x${result.slice(-40)}`.toLowerCase() : "";
}

function readUint(result) {
  try { return BigInt(result).toString(); } catch { return "0"; }
}

async function contractCall(address, data) {
  return rpc("eth_call", [{ to: address, data }, "latest"]);
}

async function verifyDexScreenerPair(market) {
  const response = await fetch(`${DEX_PAIR_URL}${market.poolAddress}`);
  if (!response.ok) throw new Error(`DexScreener returned HTTP ${response.status}`);
  const payload = await response.json();
  const pair = (payload.pairs || []).find((candidate) => sameAddress(candidate.pairAddress, market.poolAddress));
  if (!pair) throw new Error("The reviewed pair was not returned by DexScreener");
  const expected = (market.verification?.expectedTokens || []).map(normalizeAddress).sort();
  const actual = [pair.baseToken?.address, pair.quoteToken?.address].map(normalizeAddress).sort();
  if (expected.length !== 2 || expected.join(",") !== actual.join(",")) throw new Error("Pair tokens did not match the reviewed route");
  if (!sameAddress(pair.pairAddress, market.verification?.confirmedPairAddress || market.poolAddress)) throw new Error("Pair contract did not match the reviewed route");
  return {
    pairAddress: normalizeAddress(pair.pairAddress),
    baseSymbol: pair.baseToken?.symbol || null,
    quoteSymbol: pair.quoteToken?.symbol || null,
    liquidityUsd: Number(pair.liquidity?.usd || 0),
    volumeH24: Number(pair.volume?.h24 || 0),
  };
}

async function verifyWrapperPool(market) {
  const pool = normalizeAddress(market.poolAddress);
  const [code, token0Data, token1Data, feeData, liquidityData, slot0Data] = await Promise.all([
    rpc("eth_getCode", [pool, "latest"]),
    contractCall(pool, "0x0dfe1681"), // token0()
    contractCall(pool, "0xd21220a7"), // token1()
    contractCall(pool, "0xddca3f43"), // fee()
    contractCall(pool, "0x1a686502"), // liquidity()
    contractCall(pool, "0x3850c7bd"), // slot0()
  ]);
  if (!code || code === "0x") throw new Error("Pool contract has no bytecode on Mantle");
  const actualTokens = [readAddress(token0Data), readAddress(token1Data)].sort();
  const expectedTokens = (market.verification?.expectedTokens || []).map(normalizeAddress).sort();
  if (actualTokens.join(",") !== expectedTokens.join(",")) throw new Error("Pool tokens did not match the reviewed route");
  if (Number(readUint(feeData)) !== Number(market.verification?.fee)) throw new Error("Pool fee did not match the reviewed route");
  const wrapped = normalizeAddress(market.verification?.wrappedToken);
  const underlying = readAddress(await contractCall(wrapped, "0x38d52e0f")); // ERC-4626 asset()
  if (!sameAddress(underlying, market.verification?.expectedUnderlying)) throw new Error("Wrapped asset() did not resolve to the reviewed underlying token");
  return {
    poolAddress: pool,
    token0: readAddress(token0Data),
    token1: readAddress(token1Data),
    fee: Number(readUint(feeData)),
    activeLiquidityUnits: readUint(liquidityData),
    slot0Available: Boolean(slot0Data && slot0Data !== "0x"),
    wrapperUnderlying: underlying,
  };
}

async function verifyMarket(market) {
  if (market.verification?.kind === "dexscreener_pair") return verifyDexScreenerPair(market);
  if (market.verification?.kind === "uniswap_v3_wrapper_pool") return verifyWrapperPool(market);
  throw new Error(`Unsupported verification kind: ${market.verification?.kind || "missing"}`);
}

function updateLinkedSources(profile, marketId, timestamp, passed) {
  for (const source of profile.sources || []) {
    if (source.marketId === marketId) {
      source.lastAttemptAt = timestamp;
      if (passed) source.lastCheckedAt = timestamp;
    }
  }
}

async function updateProfile(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  const profile = await readJson(filePath);
  for (const market of profile.markets || []) {
    const attemptedAt = new Date().toISOString();
    try {
      const observed = await verifyMarket(market);
      market.lastCheckedAt = attemptedAt;
      market.lastAttemptAt = attemptedAt;
      market.verification = { ...market.verification, lastResult: "pass", lastObserved: observed };
      updateLinkedSources(profile, market.id, attemptedAt, true);
      console.log(`${profile.assetId}: ${market.venue} verified`);
    } catch (error) {
      market.lastAttemptAt = attemptedAt;
      market.verification = { ...market.verification, lastResult: "failed", lastError: error.message };
      updateLinkedSources(profile, market.id, attemptedAt, false);
      console.warn(`${profile.assetId}: ${market.venue} could not be verified — ${error.message}`);
    }
  }
  profile.updatedAt = new Date().toISOString();
  await writeJson(filePath, profile);
}

async function main() {
  const registry = await readJson(REGISTRY_FILE);
  for (const asset of registry.assets || []) {
    if (!asset.research) continue;
    try {
      await fs.access(path.join(ROOT, asset.research));
    } catch {
      console.log(`${asset.symbol}: no dedicated research profile yet, skipping market-route verification`);
      continue;
    }
    await updateProfile(asset.research);
  }
}

main().catch((error) => {
  console.error(`Market-route verification failed: ${error.message}`);
  process.exitCode = 1;
});
