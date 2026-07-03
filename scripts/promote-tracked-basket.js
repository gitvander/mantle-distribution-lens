/*
 * Syncs the V8 tracked-basket plan into the published registry.
 * Indexed assets remain untouched; queued assets are added once and later
 * upgraded by update-snapshots.js when the historical snapshot is published.
 */
const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const REGISTRY_FILE = path.join(ROOT, "data", "registry.json");
const CATALOG_FILE = path.join(ROOT, "data", "catalog", "xstocks-mantle.json");
const PLAN_FILE = path.join(ROOT, "data", "catalog", "tracked-basket-plan.json");

function slug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function byAddress(items) {
  return new Map((items || []).map((item) => [String(item.address || "").toLowerCase(), item]));
}

async function main() {
  const [registry, catalog, plan] = await Promise.all([
    readJson(REGISTRY_FILE),
    readJson(CATALOG_FILE),
    readJson(PLAN_FILE),
  ]);

  const catalogByAddress = byAddress(catalog.assets);
  const registryByAddress = byAddress(registry.assets);

  for (const queued of plan.assets || []) {
    const address = String(queued.address || "").toLowerCase();
    const official = catalogByAddress.get(address);
    if (!official) throw new Error(`Tracked-basket plan references an address that is missing from the official xStocks Mantle catalog: ${queued.address}`);

    const existing = registryByAddress.get(address);
    if (existing) {
      if (existing.status !== "indexed") {
        existing.status = "queued";
        existing.notes = queued.reason || existing.notes || "Queued for the V8 tracked basket pipeline.";
        existing.priority = Number(queued.priority || existing.priority || 0);
      }
      continue;
    }

    const id = official.id || `${slug(official.symbol)}-mantle`;
    registry.assets.push({
      id,
      name: official.name,
      symbol: official.symbol,
      address,
      snapshot: `data/snapshots/${id}.json`,
      research: `data/research/${id}.json`,
      status: "queued",
      priority: Number(queued.priority || 0),
      notes: queued.reason || "Queued for the V8 tracked basket pipeline."
    });
  }

  registry.assets.sort((left, right) => {
    const leftPriority = Number.isFinite(Number(left.priority)) ? Number(left.priority) : Number.MAX_SAFE_INTEGER;
    const rightPriority = Number.isFinite(Number(right.priority)) ? Number(right.priority) : Number.MAX_SAFE_INTEGER;
    if (left.status === "indexed" && right.status !== "indexed") return -1;
    if (left.status !== "indexed" && right.status === "indexed") return 1;
    if (leftPriority !== rightPriority) return leftPriority - rightPriority;
    return String(left.symbol || "").localeCompare(String(right.symbol || ""));
  });

  registry.generatedAt = new Date().toISOString();
  await writeJson(REGISTRY_FILE, registry);
  console.log(`Tracked basket sync complete. Registry now contains ${registry.assets.length} assets.`);
}

main().catch((error) => {
  console.error(`Tracked basket sync failed: ${error.message}`);
  process.exitCode = 1;
});
