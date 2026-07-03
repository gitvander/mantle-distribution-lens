/* Unified publishing flow: refresh on-chain distribution snapshots and market evidence. */
const fs = require("fs/promises");
const { spawn } = require("child_process");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LOCK_FILE = path.join(ROOT, "data", "refresh.lock");
const LOCK_STALE_MS = 4 * 60 * 60 * 1000;
const jobs = [
  { script: "scripts/update-xstocks-catalog.js", required: true },
  { script: "scripts/sync-v13-registry.js", required: true },
  { script: "scripts/update-snapshots.js", required: false },
  { script: "scripts/discover-fluxion-factory-events.js", required: false },
  { script: "scripts/discover-fluxion-rwa-pools.js", required: false },
  { script: "scripts/verify-fluxion-basket.js", required: false },
  { script: "scripts/discover-merchant-moe-pools.js", required: false },
  { script: "scripts/verify-merchant-moe-tvl.js", required: false },
  { script: "scripts/build-platform-tvl.js", required: true },
];

function run(script) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], { cwd: ROOT, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${script} exited with code ${code}`)));
  });
}

function isProcessAlive(pid) {
  const numeric = Number(pid);
  if (!Number.isInteger(numeric) || numeric <= 0) return false;
  try {
    process.kill(numeric, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
}

async function acquireRefreshLock() {
  const lock = {
    pid: process.pid,
    startedAt: new Date().toISOString(),
    note: "Mantle Distribution Lens complete refresh lock"
  };
  try {
    await fs.writeFile(LOCK_FILE, `${JSON.stringify(lock, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const existing = await fs.readFile(LOCK_FILE, "utf8").then(JSON.parse).catch(() => null);
    if (existing?.pid && !isProcessAlive(existing.pid)) {
      console.warn("Found a refresh lock from a process that is no longer running; removing it and continuing.");
      await fs.unlink(LOCK_FILE).catch(() => {});
      return acquireRefreshLock();
    }
    const startedAt = existing?.startedAt ? Date.parse(existing.startedAt) : 0;
    const age = startedAt ? Date.now() - startedAt : Infinity;
    if (age > LOCK_STALE_MS) {
      console.warn("Found an old refresh lock; removing it and continuing.");
      await fs.unlink(LOCK_FILE).catch(() => {});
      return acquireRefreshLock();
    }
    const when = existing?.startedAt || "unknown time";
    throw new Error(`Another complete refresh appears to be running since ${when}. Close the other updater window before starting a new one.`);
  }
  return async () => {
    await fs.unlink(LOCK_FILE).catch(() => {});
  };
}

(async () => {
  const releaseLock = await acquireRefreshLock();
  try {
  console.log("Refreshing the complete published Lens...");
  console.log("This updates tracked distribution snapshots, verified routes, TVL, and route quotes.");
  const failures = [];
  for (const job of jobs) {
    try {
      await run(job.script);
    } catch (error) {
      failures.push({ ...job, error });
      console.warn(`${job.script} failed: ${error.message}`);
      if (job.required) throw error;
      console.warn("Continuing with the remaining refresh steps so market data can still update.");
    }
  }
  if (failures.length) {
    console.warn(`Complete refresh finished with ${failures.length} non-blocking issue(s). Review the messages above.`);
  }
  console.log("Complete published Lens data is ready.");
  } finally {
    await releaseLock();
  }
})().catch((error) => { console.error(`Published refresh failed: ${error.message}`); process.exitCode = 1; });
