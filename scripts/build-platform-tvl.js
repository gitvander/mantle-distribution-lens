/* Builds a simple, auditable TVL view from monitored platform observations. */
const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BASKET_FILE = path.join(ROOT, "data", "catalog", "fluxion-liquidity-basket.json");
const DIRECT_FLUXION_FILE = path.join(ROOT, "data", "catalog", "fluxion-direct-routes.json");
const DISCOVERED_FLUXION_FILE = path.join(ROOT, "data", "catalog", "fluxion-discovered-routes.json");
const MERCHANT_FILE = path.join(ROOT, "data", "catalog", "merchant-moe-routes.json");
const DISCOVERED_MERCHANT_FILE = path.join(ROOT, "data", "catalog", "merchant-moe-discovered-routes.json");
const OUTPUT_FILE = path.join(ROOT, "data", "catalog", "platform-tvl.json");

function assetId(symbol) { return `${String(symbol || "").toLowerCase()}-mantle`; }
function safeAmount(value) { const amount = Number(value); return Number.isFinite(amount) && amount > 0 ? amount : 0; }

async function main() {
  const [basket, directFluxion, discoveredFluxion, merchant, discoveredMerchant] = await Promise.all([
    fs.readFile(BASKET_FILE, "utf8").then(JSON.parse),
    fs.readFile(DIRECT_FLUXION_FILE, "utf8").then(JSON.parse),
    fs.readFile(DISCOVERED_FLUXION_FILE, "utf8").then(JSON.parse).catch(() => ({ routes: [] })),
    fs.readFile(MERCHANT_FILE, "utf8").then(JSON.parse),
    fs.readFile(DISCOVERED_MERCHANT_FILE, "utf8").then(JSON.parse).catch(() => ({ routes: [] })),
  ]);
  const observations = [];
  for (const asset of basket.assets || []) {
    const observed = asset.verification?.lastObserved;
    const tvlUsd = safeAmount(observed?.poolTvlUsd || asset.observedTvlUsd);
    if (!tvlUsd) continue;
    observations.push({
      assetId: assetId(asset.symbol), symbol: asset.symbol, platform: "Fluxion", tvlUsd,
      capturedAt: observed?.poolTvlCapturedAt || basket.selection?.capturedAt || null,
      type: observed?.poolTvlUsd ? "onchain_pool_balances" : "platform_reported_snapshot", pool: asset.pool, url: `https://fluxion.network/pool/${asset.pool}`,
    });
  }
  for (const route of directFluxion.routes || []) {
    const observed = route.verification?.lastObserved;
    const tvlUsd = safeAmount(observed?.poolTvlUsd);
    if (!tvlUsd) continue;
    observations.push({ assetId: route.assetId, symbol: route.symbol, platform: "Fluxion", tvlUsd,
      capturedAt: observed.poolTvlCapturedAt || null, type: "onchain_pool_balances", pool: route.pool, url: route.url });
  }
  for (const route of discoveredFluxion.routes || []) {
    const observed = route.verification?.lastObserved;
    const tvlUsd = safeAmount(observed?.poolTvlUsd);
    if (!tvlUsd || observations.some((item) => item.platform === "Fluxion" && item.pool === route.pool)) continue;
    observations.push({ assetId: route.assetId, symbol: route.symbol, platform: "Fluxion", tvlUsd,
      capturedAt: observed.poolTvlCapturedAt || route.verifiedAt || null, type: "onchain_pool_balances", pool: route.pool, url: route.url });
  }
  for (const route of merchant.routes || []) {
    const observed = route.verification?.lastObserved;
    const tvlUsd = safeAmount(observed?.tvlUsd);
    if (!tvlUsd) continue;
    observations.push({
      assetId: route.assetId, symbol: route.symbol, platform: "Merchant Moe", tvlUsd,
      capturedAt: observed.capturedAt || null, type: "onchain_reserves_valued", pool: observed.pool || route.poolAddress, url: route.url,
    });
  }
  for (const route of discoveredMerchant.routes || []) {
    const observed = route.verification?.lastObserved;
    const tvlUsd = safeAmount(observed?.tvlUsd);
    if (!tvlUsd || observations.some((item) => item.platform === "Merchant Moe" && item.pool === route.poolAddress)) continue;
    observations.push({ assetId: route.assetId, symbol: route.symbol, platform: "Merchant Moe", tvlUsd,
      capturedAt: observed.capturedAt || route.verifiedAt || null, type: "onchain_reserves_valued", pool: route.poolAddress, url: route.url });
  }
  const byAsset = {};
  for (const item of observations) {
    if (!byAsset[item.assetId]) byAsset[item.assetId] = [];
    byAsset[item.assetId].push(item);
  }
  const assets = Object.entries(byAsset).map(([id, platforms]) => ({
    assetId: id, totalTvlUsd: platforms.reduce((sum, item) => sum + item.tvlUsd, 0), platforms,
  }));
  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify({ schema: 1, generatedAt: new Date().toISOString(), assets }, null, 2)}\n`, "utf8");
  console.log(`Platform TVL view ready: ${assets.length} assets with monitored pools.`);
}

main().catch((error) => { console.error(`Platform TVL build failed: ${error.message}`); process.exitCode = 1; });
