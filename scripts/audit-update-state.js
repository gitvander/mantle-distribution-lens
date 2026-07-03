const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const REGISTRY_FILE = path.join(ROOT, "data", "registry.json");
const CHECKPOINT_DIR = path.join(ROOT, "data", "checkpoints");

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function readOptionalJson(file) {
  try {
    return await readJson(file);
  } catch {
    return null;
  }
}

function relativeJson(relativePath) {
  return readOptionalJson(path.join(ROOT, relativePath));
}

function checkpointPath(asset) {
  return path.join(CHECKPOINT_DIR, `${asset.id}.json`);
}

function number(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatBlock(value) {
  return number(value).toLocaleString("en-US");
}

function describeAction(asset, snapshot, checkpoint) {
  const snapshotBlock = number(snapshot?.coverage?.lastIndexedBlock);
  if (checkpoint) {
    const next = number(checkpoint.nextBlock);
    const target = number(checkpoint.targetBlock);
    const completed = Math.max(0, next - 1);
    const savedProgress = completed > snapshotBlock
      ? `; saved checkpoint progress through ${formatBlock(completed)} should be published/resumed`
      : "";
    const publishError = checkpoint.lastPublishError
      ? `; last partial publish error: ${checkpoint.lastPublishError}`
      : "";
    if (next <= snapshotBlock) {
      return `checkpoint stale; updater should drop it and restart at ${formatBlock(snapshotBlock + 1)}`;
    }
    return `resume checkpoint at ${formatBlock(next)} of ${formatBlock(target)}${savedProgress}${publishError}`;
  }
  if (snapshotBlock > 0) return `next incremental start: ${formatBlock(snapshotBlock + 1)}`;
  return "no snapshot yet; updater will find contract creation block";
}

function describeRecent(snapshot, recent) {
  const snapshotBlock = number(snapshot?.coverage?.lastIndexedBlock);
  const recentBlock = number(recent?.coverage?.lastIndexedBlock);
  if (!recentBlock || recentBlock <= snapshotBlock) return "";
  const recentStart = number(recent?.coverage?.startBlock);
  const recentTransfers = number(recent?.stats?.transferCount);
  const recentFirst = number(recent?.stats?.firstTransferBlock);
  const recentLast = number(recent?.stats?.lastTransferBlock);
  if (!recentStart) {
    return `; recent snapshot ahead at ${formatBlock(recentBlock)} but old format has no startBlock, so it is not used as a skip`;
  }
  if (recentStart > snapshotBlock + 1) {
    return `; recent snapshot ahead at ${formatBlock(recentBlock)} but leaves a gap from ${formatBlock(snapshotBlock + 1)} to ${formatBlock(recentStart - 1)}`;
  }
  if (!recentTransfers || !recentLast || recentLast <= snapshotBlock) {
    return `; recent snapshot can safely advance coverage to ${formatBlock(recentBlock)} because it has no new transfers after the historical snapshot`;
  }
  if (recentFirst > snapshotBlock) {
    return `; recent snapshot can safely merge new transfers through ${formatBlock(recentBlock)}`;
  }
  return `; recent snapshot ahead at ${formatBlock(recentBlock)} overlaps existing transfer history, so the updater will scan incrementally`;
}

async function main() {
  const registry = await readJson(REGISTRY_FILE);
  console.log(`Mantle Distribution Lens update audit`);
  console.log(`Registry generatedAt: ${registry.generatedAt || "unknown"}`);
  console.log("");
  for (const asset of registry.assets || []) {
    const snapshot = await relativeJson(asset.snapshot);
    const checkpoint = await readOptionalJson(checkpointPath(asset));
    const recent = asset.recentSnapshot
      ? await relativeJson(asset.recentSnapshot)
      : await relativeJson(`data/recent-snapshots/${asset.id}.json`);
    const snapshotBlock = number(snapshot?.coverage?.lastIndexedBlock);
    const checkpointNext = number(checkpoint?.nextBlock);
    const checkpointTarget = number(checkpoint?.targetBlock);
    const checkpointProgress = checkpoint
      ? `${formatBlock(checkpointNext)} -> ${formatBlock(checkpointTarget)} (${formatBlock(Math.max(0, checkpointTarget - checkpointNext + 1))} blocks remaining)`
      : "none";
    console.log(`${asset.symbol}:`);
    console.log(`  published: ${formatBlock(snapshotBlock)} · ${snapshot?.coverage?.lastIndexedAt || "no date"} · transfers ${number(snapshot?.stats?.transferCount)}`);
    console.log(`  checkpoint: ${checkpointProgress}`);
    console.log(`  action: ${describeAction(asset, snapshot, checkpoint)}${describeRecent(snapshot, recent)}`);
  }
}

main().catch((error) => {
  console.error(`Audit failed: ${error.message}`);
  process.exitCode = 1;
});
