/*
 * Resumable publisher for the static research site.
 *
 * V13 publishes a comparable, rolling 30-day research window for the Fluxion
 * starter basket. It remains resumable, read-only, and uses the RPC pool.
 */
const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const REGISTRY_FILE = path.join(ROOT, "data", "registry.json");
const CHECKPOINT_DIR = path.join(ROOT, "data", "recent-checkpoints");
const RPC_POOL_FILE = path.join(ROOT, "data", "catalog", "rpc-pool.json");
const DEFAULT_RPC_URL = process.env.MANTLE_RPC_URL || "https://rpc.mantle.xyz";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const INITIAL_CHUNK = 100000;
const MINIMUM_CHUNK = 1000;
const RPC_RETRIES = 4;
const RPC_RETRY_BASE_MS = 900;
const BETWEEN_ASSETS_MS = 350;
const CHECKPOINT_SCHEMA = 2;
const DEFAULT_WORKERS = 2;
const MAX_WORKERS = 2;
const PROGRESS_LOG_STEP = 250000;
const WINDOW_DAYS = Math.max(1, Math.min(90, Number(process.env.RECENT_WINDOW_DAYS || 30)));

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function hex(number) {
  return `0x${Number(number).toString(16)}`;
}

function fromHex(value) {
  return Number(BigInt(value));
}

function addressFromTopic(topic) {
  return `0x${topic.slice(-40)}`.toLowerCase();
}

function checkpointFile(asset) {
  return path.join(CHECKPOINT_DIR, `${asset.id}.json`);
}

function emptyStats() {
  return {
    transferCount: 0,
    walletAddresses: [],
    mints: 0,
    burns: 0,
    firstTransferBlock: null,
    lastTransferBlock: null,
  };
}

function merge(base, addition) {
  const wallets = new Set([...(base.walletAddresses || []), ...(addition.walletAddresses || [])]);
  return {
    transferCount: (base.transferCount || 0) + (addition.transferCount || 0),
    walletAddresses: [...wallets],
    mints: (base.mints || 0) + (addition.mints || 0),
    burns: (base.burns || 0) + (addition.burns || 0),
    firstTransferBlock: base.firstTransferBlock ?? addition.firstTransferBlock ?? null,
    lastTransferBlock: addition.lastTransferBlock ?? base.lastTransferBlock ?? null,
  };
}

function summarizeBatch(events) {
  const wallets = new Set();
  let mints = 0;
  let burns = 0;
  let firstTransferBlock = null;
  let lastTransferBlock = null;
  for (const event of events) {
    const from = addressFromTopic(event.topics[1]);
    const to = addressFromTopic(event.topics[2]);
    const block = fromHex(event.blockNumber);
    firstTransferBlock = firstTransferBlock === null ? block : Math.min(firstTransferBlock, block);
    lastTransferBlock = lastTransferBlock === null ? block : Math.max(lastTransferBlock, block);
    if (from === ZERO_ADDRESS) mints += 1;
    else wallets.add(from);
    if (to === ZERO_ADDRESS) burns += 1;
    else wallets.add(to);
  }
  return { transferCount: events.length, walletAddresses: [...wallets], mints, burns, firstTransferBlock, lastTransferBlock };
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function readOptionalJson(filePath) {
  try {
    return await readJson(filePath);
  } catch {
    return null;
  }
}

async function readSnapshot(relativePath) {
  return readOptionalJson(path.join(ROOT, relativePath));
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalizeRpcEndpoint(endpoint, index) {
  if (!endpoint || typeof endpoint.url !== "string" || !endpoint.url.trim()) return null;
  return {
    id: String(endpoint.id || `rpc-${index + 1}`),
    label: String(endpoint.label || endpoint.id || `RPC ${index + 1}`),
    url: endpoint.url.trim(),
    enabled: endpoint.enabled !== false,
  };
}

function parseEnvRpcPool() {
  const raw = process.env.MANTLE_RPC_POOL;
  if (!raw || !raw.trim()) return [];
  return raw
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry, index) => {
      const parts = entry.split("=");
      if (parts.length >= 2) {
        const label = parts.shift();
        return normalizeRpcEndpoint({ id: `env-${index + 1}`, label, url: parts.join("="), enabled: true }, index);
      }
      return normalizeRpcEndpoint({ id: `env-${index + 1}`, label: `Env RPC ${index + 1}`, url: entry, enabled: true }, index);
    })
    .filter(Boolean);
}

async function loadRpcPool() {
  const fromFile = await readOptionalJson(RPC_POOL_FILE);
  const fileEndpoints = Array.isArray(fromFile?.endpoints)
    ? fromFile.endpoints.map(normalizeRpcEndpoint).filter((endpoint) => endpoint && endpoint.enabled)
    : [];
  const envEndpoints = parseEnvRpcPool();
  const endpoints = envEndpoints.length
    ? envEndpoints
    : fileEndpoints.length
      ? fileEndpoints
      : [normalizeRpcEndpoint({ id: "mantle-public", label: "Mantle Public RPC", url: DEFAULT_RPC_URL, enabled: true }, 0)];
  return { schema: 1, source: envEndpoints.length ? "env" : fileEndpoints.length ? "file" : "default", endpoints };
}

function resolveWorkerCount() {
  const requested = Number(process.env.SNAPSHOT_WORKERS || DEFAULT_WORKERS);
  if (!Number.isFinite(requested)) return DEFAULT_WORKERS;
  return Math.max(1, Math.min(MAX_WORKERS, Math.floor(requested)));
}

function stableHash(value) {
  let hash = 0;
  for (const character of String(value || "")) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function buildRpcPlan(asset, rpcPool) {
  const endpoints = rpcPool.endpoints || [];
  if (!endpoints.length) throw new Error("No Mantle RPC endpoints are configured.");
  const offset = stableHash(asset.id || asset.address || asset.symbol) % endpoints.length;
  return endpoints.slice(offset).concat(endpoints.slice(0, offset));
}

function createRpcContext(asset, rpcPool) {
  const plan = buildRpcPlan(asset, rpcPool);
  return {
    asset,
    rpcPoolSource: rpcPool.source,
    rpcPlan: plan,
    lastHealthyRpc: null,
    lastRpcError: null,
    rpcUsage: [],
  };
}

async function rpc(context, method, params) {
  let lastError = null;
  for (const endpoint of context.rpcPlan) {
    for (let attempt = 0; attempt < RPC_RETRIES; attempt += 1) {
      try {
        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || body.error) throw new Error(body.error?.message || `RPC request failed: ${method}`);
        if (body.result === null && method === "eth_getBlockByNumber") {
          throw new Error(`Block request returned null for ${params?.[0] || "unknown block"}`);
        }
        context.lastHealthyRpc = endpoint;
        if (!context.rpcUsage.includes(endpoint.id)) context.rpcUsage.push(endpoint.id);
        return body.result;
      } catch (error) {
        lastError = error;
        context.lastRpcError = { endpointId: endpoint.id, endpointLabel: endpoint.label, message: error.message };
        if (attempt < RPC_RETRIES - 1) await sleep(RPC_RETRY_BASE_MS * (attempt + 1));
      }
    }
  }
  const endpointLabel = context.lastRpcError?.endpointLabel ? ` (${context.lastRpcError.endpointLabel})` : "";
  throw new Error(`${lastError?.message || `RPC request failed: ${method}`}${endpointLabel}`);
}

async function getBlock(context, number) {
  const block = await rpc(context, "eth_getBlockByNumber", [hex(number), false]);
  return { number: fromHex(block.number), timestamp: fromHex(block.timestamp) };
}

async function findBlockAtOrAfterTimestamp(context, targetTimestamp, latestBlock) {
  let low = 0;
  let high = latestBlock;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const block = await getBlock(context, middle);
    if (block.timestamp >= targetTimestamp) high = middle;
    else low = middle + 1;
  }
  return low;
}

async function marketSnapshot(address) {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
    const body = await response.json();
    const pairs = Array.isArray(body.pairs) ? body.pairs.filter((pair) => String(pair.chainId).toLowerCase() === "mantle") : [];
    return {
      capturedAt: new Date().toISOString(),
      pairs: pairs.map((pair) => ({
        dexId: pair.dexId || null,
        pairAddress: pair.pairAddress || null,
        priceUsd: pair.priceUsd || null,
        liquidityUsd: Number(pair.liquidity?.usd || 0),
        volumeH24: Number(pair.volume?.h24 || 0),
        url: pair.url || null,
      })),
    };
  } catch {
    return { capturedAt: new Date().toISOString(), pairs: [] };
  }
}

async function readCheckpoint(asset) {
  const checkpoint = await readOptionalJson(checkpointFile(asset));
  if (!checkpoint || (checkpoint.schema !== 1 && checkpoint.schema !== CHECKPOINT_SCHEMA)) return null;
  return checkpoint;
}

async function writeCheckpoint(asset, checkpoint) {
  await writeJson(checkpointFile(asset), checkpoint);
}

async function deleteCheckpoint(asset) {
  try {
    await fs.unlink(checkpointFile(asset));
  } catch {
    // No checkpoint to remove.
  }
}

async function scanTransferRange(context, asset, checkpoint) {
  let cursor = Number(checkpoint.nextBlock);
  let chunk = Number(checkpoint.chunkSize || INITIAL_CHUNK);
  let stats = checkpoint.stats || emptyStats();
  const totalBlocks = checkpoint.targetBlock - checkpoint.startBlock + 1;
  let lastLoggedProgress = Number(checkpoint.lastLoggedProgress || 0);

  while (cursor <= checkpoint.targetBlock) {
    const end = Math.min(checkpoint.targetBlock, cursor + chunk - 1);
    try {
      const batch = await rpc(context, "eth_getLogs", [{
        address: asset.address.toLowerCase(),
        fromBlock: hex(cursor),
        toBlock: hex(end),
        topics: [TRANSFER_TOPIC]
      }]);
      stats = merge(stats, summarizeBatch(batch));
      checkpoint.stats = stats;
      checkpoint.nextBlock = end + 1;
      checkpoint.chunkSize = chunk;
      checkpoint.updatedAt = new Date().toISOString();
      checkpoint.lastHealthyRpcId = context.lastHealthyRpc?.id || checkpoint.lastHealthyRpcId || null;
      checkpoint.lastHealthyRpcLabel = context.lastHealthyRpc?.label || checkpoint.lastHealthyRpcLabel || null;
      await writeCheckpoint(asset, checkpoint);
      const completedBlocks = Math.min(checkpoint.nextBlock - checkpoint.startBlock, totalBlocks);
      if (completedBlocks - lastLoggedProgress >= PROGRESS_LOG_STEP || completedBlocks === totalBlocks) {
        console.log(`${asset.symbol}: ${completedBlocks}/${totalBlocks} blocks`);
        lastLoggedProgress = completedBlocks;
        checkpoint.lastLoggedProgress = lastLoggedProgress;
        await writeCheckpoint(asset, checkpoint);
      }
      if (batch.length < 500 && chunk < INITIAL_CHUNK) chunk = Math.min(INITIAL_CHUNK, chunk * 2);
      cursor = end + 1;
    } catch (error) {
      if (chunk <= MINIMUM_CHUNK) throw error;
      chunk = Math.max(MINIMUM_CHUNK, Math.floor(chunk / 2));
      checkpoint.chunkSize = chunk;
      checkpoint.updatedAt = new Date().toISOString();
      await writeCheckpoint(asset, checkpoint);
    }
  }

  return stats;
}

async function buildRecentCheckpoint(context, asset, latest) {
  console.log(`${asset.symbol}: using RPC plan ${context.rpcPlan.map((endpoint) => endpoint.label).join(" -> ")}`);
  const targetTimestamp = latest.timestamp - (WINDOW_DAYS * 24 * 60 * 60);
  console.log(`${asset.symbol}: locating the start of the ${WINDOW_DAYS}-day window`);
  const startBlock = await findBlockAtOrAfterTimestamp(context, targetTimestamp, latest.number);
  const start = await getBlock(context, startBlock);
  console.log(`${asset.symbol}: recent indexing range ${startBlock}-${latest.number}`);
  return {
    schema: CHECKPOINT_SCHEMA,
    mode: "recent_window",
    assetId: asset.id,
    address: asset.address.toLowerCase(),
    symbol: asset.symbol,
    name: asset.name,
    startBlock,
    nextBlock: startBlock,
    targetBlock: latest.number,
    targetTimestamp: latest.timestamp,
    windowDays: WINDOW_DAYS,
    windowStartedAt: new Date(start.timestamp * 1000).toISOString(),
    stats: emptyStats(),
    chunkSize: INITIAL_CHUNK,
    rpcPlan: context.rpcPlan.map((endpoint) => ({ id: endpoint.id, label: endpoint.label, url: endpoint.url })),
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function ensureCheckpoint(context, asset, snapshot, latest) {
  const existingCheckpoint = await readCheckpoint(asset);
  if (existingCheckpoint) {
    if (!Array.isArray(existingCheckpoint.rpcPlan) || !existingCheckpoint.rpcPlan.length) {
      existingCheckpoint.rpcPlan = context.rpcPlan.map((endpoint) => ({ id: endpoint.id, label: endpoint.label, url: endpoint.url }));
      existingCheckpoint.schema = CHECKPOINT_SCHEMA;
      await writeCheckpoint(asset, existingCheckpoint);
    }
    console.log(`${asset.symbol}: resuming checkpoint ${existingCheckpoint.nextBlock}-${existingCheckpoint.targetBlock}`);
    return existingCheckpoint;
  }
  return buildRecentCheckpoint(context, asset, latest);
}

async function updateAsset(asset, rpcPool) {
  const context = createRpcContext(asset, rpcPool);
  const recentSnapshotPath = asset.recentSnapshot || asset.snapshot;
  const snapshot = await readSnapshot(recentSnapshotPath);
  const latestNumber = fromHex(await rpc(context, "eth_blockNumber", []));
  const latest = await getBlock(context, latestNumber);
  const checkpoint = await ensureCheckpoint(context, asset, snapshot, latest);
  await writeCheckpoint(asset, checkpoint);
  const stats = await scanTransferRange(context, asset, checkpoint);
  const completedSnapshot = {
    schema: 1,
    generatedAt: new Date().toISOString(),
    asset: { id: asset.id, name: asset.name, symbol: asset.symbol, address: asset.address.toLowerCase(), chainId: 5000 },
    coverage: {
      type: "recent_30_day_window",
      windowDays: checkpoint.windowDays,
      startBlock: checkpoint.startBlock,
      windowStartedAt: checkpoint.windowStartedAt,
      firstTransferBlock: stats.firstTransferBlock,
      lastTransferBlock: stats.lastTransferBlock,
      lastIndexedBlock: checkpoint.targetBlock,
      lastIndexedAt: new Date(checkpoint.targetTimestamp * 1000).toISOString(),
    },
    stats,
    market: await marketSnapshot(asset.address.toLowerCase()),
    sources: {
      rpcPoolSource: context.rpcPoolSource,
      rpcEndpointsUsed: context.rpcUsage.map((id) => {
        const endpoint = context.rpcPlan.find((item) => item.id === id);
        return { id, label: endpoint?.label || id, url: endpoint?.url || null };
      }),
      explorer: `https://mantlescan.xyz/token/${asset.address.toLowerCase()}`,
      market: "https://api.dexscreener.com"
    }
  };

  await writeJson(path.join(ROOT, recentSnapshotPath), completedSnapshot);
  await deleteCheckpoint(asset);
  asset.status = "indexed";
  asset.lastSnapshotAttemptAt = new Date().toISOString();
  asset.lastSnapshotSuccessAt = asset.lastSnapshotAttemptAt;
  asset.lastRpcUsed = context.lastHealthyRpc?.label || null;
  delete asset.lastSnapshotError;
  return completedSnapshot;
}

async function processAsset(asset, rpcPool) {
  try {
    await updateAsset(asset, rpcPool);
    return { asset, ok: true };
  } catch (error) {
    asset.lastSnapshotAttemptAt = new Date().toISOString();
    asset.lastSnapshotError = error.message;
    if (asset.status !== "indexed") asset.status = "queued";
    console.warn(`${asset.symbol}: snapshot skipped - ${error.message}`);
    return { asset, ok: false, error };
  }
}

async function runWithWorkers(items, workerCount, handler) {
  const queue = [...items];
  const results = [];
  async function worker(workerId) {
    while (queue.length) {
      const item = queue.shift();
      if (!item) return;
      const result = await handler(item, workerId);
      results.push(result);
      await sleep(BETWEEN_ASSETS_MS);
    }
  }
  await Promise.all(Array.from({ length: Math.min(workerCount, queue.length || workerCount) }, (_, index) => worker(index + 1)));
  return results;
}

async function main() {
  const registry = await readJson(REGISTRY_FILE);
  const rpcPool = await loadRpcPool();
  const workerCount = resolveWorkerCount();
  console.log(`Mantle RPC pool loaded from ${rpcPool.source}: ${rpcPool.endpoints.map((endpoint) => endpoint.label).join(", ")}`);
  console.log(`Research window: last ${WINDOW_DAYS} days`);
  console.log(`Parallel workers: ${workerCount}`);
  const orderedAssets = [...registry.assets].sort((left, right) => {
    const leftPriority = Number(left.priority || 9999);
    const rightPriority = Number(right.priority || 9999);
    return leftPriority - rightPriority;
  });
  const results = await runWithWorkers(orderedAssets, workerCount, (asset) => processAsset(asset, rpcPool));
  const failures = results.filter((result) => !result.ok).length;
  registry.generatedAt = new Date().toISOString();
  await writeJson(REGISTRY_FILE, registry);
  if (failures) {
    console.warn(`Snapshot update finished with ${failures} asset failure(s).`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Snapshot update failed: ${error.message}`);
  process.exitCode = 1;
});
