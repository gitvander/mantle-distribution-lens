/* Builds the public research registry from reviewed and discovered Mantle RWA routes. */
const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BASKET_FILE = path.join(ROOT, "data", "catalog", "fluxion-liquidity-basket.json");
const DISCOVERED_FILE = path.join(ROOT, "data", "catalog", "fluxion-discovered-routes.json");
const REGISTRY_FILE = path.join(ROOT, "data", "registry.json");

async function exists(relativePath) {
  try { await fs.access(path.join(ROOT, relativePath)); return true; } catch { return false; }
}

function entry({ id, name, symbol, address, priority, pool, wrapper, notes }) {
  const snapshot = `data/historical-snapshots/${id}.json`;
  return {
    id, name, symbol, address: address.toLowerCase(), snapshot,
    status: "queued", priority,
    notes,
    fluxion: pool ? {
      pool: pool.toLowerCase(), wrapper: wrapper ? wrapper.toLowerCase() : "", fee: 3000,
      url: `https://fluxion.network/pool/${pool.toLowerCase()}`,
      quoteToken: "0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9"
    } : null,
  };
}

async function readOptionalJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return null;
  }
}

async function applySnapshotState(asset) {
  const historicalSnapshot = `data/historical-snapshots/${asset.id}.json`;
  const recentSnapshot = `data/recent-snapshots/${asset.id}.json`;
  if (await exists(historicalSnapshot)) {
    asset.snapshot = historicalSnapshot;
    asset.status = "indexed";
    asset.coverageMode = asset.id === "spcxx-mantle" ? "historical_pilot_with_recent_comparison" : "historical_with_recent_comparison";
    if (await exists(recentSnapshot)) asset.recentSnapshot = recentSnapshot;
    return;
  }
  if (await exists(recentSnapshot)) {
    asset.snapshot = recentSnapshot;
    asset.status = "indexed";
    asset.coverageMode = "recent_window";
    return;
  }
  asset.snapshot = historicalSnapshot;
  asset.status = "queued";
}

async function main() {
  const basket = JSON.parse(await fs.readFile(BASKET_FILE, "utf8"));
  const assets = [entry({
    id: "spcxx-mantle", name: "Tokenized SpaceX", symbol: "SPCXx",
    address: "0x68fa48b1c2fe52b3d776e1953e0e782b5044ce28", priority: 0,
    pool: "0xdcc6578d509baa30463319409ff38642698056a5", wrapper: "0x8e2eed8b8b5e13ea7bf38e50d7821d2c57309072",
    notes: "Fluxion wrapper route; Merchant Moe SPCXx/USDT0 is recorded separately until its metric adapter is verified."
  })];
  for (const item of basket.assets || []) {
    assets.push(entry({
      id: `${item.symbol.toLowerCase()}-mantle`, name: item.name, symbol: item.symbol,
      address: item.address, priority: Number(item.rank || 999), pool: item.pool, wrapper: item.wrapper,
      notes: "Fluxion RWA pool: USDC -> wrapper -> reviewed xStock underlying."
    }));
  }

  const discovered = await readOptionalJson(DISCOVERED_FILE);
  const knownAddresses = new Set(assets.map((asset) => asset.address.toLowerCase()));
  for (const route of discovered?.routes || []) {
    const address = route.underlying?.toLowerCase();
    if (!address || knownAddresses.has(address)) continue;
    knownAddresses.add(address);
    assets.push(entry({
      id: route.assetId || `${String(route.symbol || "").toLowerCase()}-mantle`,
      name: route.name,
      symbol: route.symbol,
      address,
      priority: assets.length,
      pool: route.pool,
      wrapper: route.wrapper,
      notes: "Fluxion RWA pool discovered from Factory events and promoted when a historical snapshot exists."
    }));
  }

  for (const asset of assets) {
    await applySnapshotState(asset);
  }
  const registry = {
    schema: 3,
    network: { name: "Mantle", chainId: 5000 },
    generatedAt: new Date().toISOString(),
    methodology: "V28 uses full historical snapshots when available. Fluxion routes are verified onchain; quote simulations are separate from third-party TVL observations.",
    assets
  };
  await fs.writeFile(REGISTRY_FILE, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  console.log(`V28 registry ready: ${assets.length} assets in the historical research universe.`);
}

main().catch((error) => { console.error(`Registry sync failed: ${error.message}`); process.exitCode = 1; });
