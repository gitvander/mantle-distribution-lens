/* A tiny, dependency-free local server. It proxies only the approved public
 * research sources so the browser does not need direct cross-origin access.
 * V29 polishes the product interface while keeping the data pipeline intact. */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 4201);
const ROOT = __dirname;
const RPC_POOL_FILE = path.join(ROOT, "data", "catalog", "rpc-pool.json");
const DEFAULT_RPC_URL = process.env.MANTLE_RPC_URL || "https://rpc.mantle.xyz";
const DEX_URL = "https://api.dexscreener.com/latest/dex/tokens/";
const ALLOWED_RPC_METHODS = new Set(["eth_blockNumber", "eth_call", "eth_getLogs", "eth_getBlockByNumber", "eth_getCode"]);
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
};
let rpcCursor = 0;

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(body));
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

function loadRpcPool() {
  const envEndpoints = parseEnvRpcPool();
  if (envEndpoints.length) return envEndpoints;
  try {
    const parsed = JSON.parse(fs.readFileSync(RPC_POOL_FILE, "utf8"));
    const endpoints = Array.isArray(parsed?.endpoints)
      ? parsed.endpoints.map(normalizeRpcEndpoint).filter((endpoint) => endpoint && endpoint.enabled)
      : [];
    if (endpoints.length) return endpoints;
  } catch {
    // Fall back to default endpoint.
  }
  return [normalizeRpcEndpoint({ id: "mantle-public", label: "Mantle Public RPC", url: DEFAULT_RPC_URL, enabled: true }, 0)];
}

const RPC_POOL = loadRpcPool();

function nextRpcPlan() {
  if (!RPC_POOL.length) return [];
  const offset = rpcCursor % RPC_POOL.length;
  rpcCursor += 1;
  return RPC_POOL.slice(offset).concat(RPC_POOL.slice(0, offset));
}

function readBody(request, limit = 32_000) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > limit) reject(new Error("Request body is too large."));
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function proxyRpc(request, response) {
  try {
    const payload = JSON.parse(await readBody(request));
    if (!payload || !ALLOWED_RPC_METHODS.has(payload.method) || !Array.isArray(payload.params)) {
      return json(response, 400, { error: { message: "Unsupported RPC request." } });
    }
    let lastError = null;
    for (const endpoint of nextRpcPlan()) {
      try {
        const upstream = await fetch(endpoint.url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: payload.method, params: payload.params }),
        });
        const data = await upstream.json();
        if (!upstream.ok || data.error) {
          throw new Error(data.error?.message || `RPC request failed on ${endpoint.label}`);
        }
        response.setHeader("x-mantle-rpc", endpoint.label);
        return json(response, 200, data);
      } catch (error) {
        lastError = error;
      }
    }
    return json(response, 502, { error: { message: `Mantle RPC unavailable: ${lastError?.message || "all endpoints failed"}` } });
  } catch (error) {
    return json(response, 502, { error: { message: `Mantle RPC unavailable: ${error.message}` } });
  }
}

async function proxyDex(address, response) {
  try {
    const upstream = await fetch(`${DEX_URL}${address}`);
    const data = await upstream.json();
    return json(response, upstream.ok ? 200 : 502, data);
  } catch (error) {
    return json(response, 502, { error: `DEX market data unavailable: ${error.message}` });
  }
}

function serveFile(requestPath, response) {
  const requested = requestPath === "/" ? "/index.html" : requestPath;
  const localPath = path.resolve(ROOT, `.${requested}`);
  if (!localPath.startsWith(ROOT)) return json(response, 403, { error: "Forbidden" });
  fs.readFile(localPath, (error, content) => {
    if (error) return json(response, error.code === "ENOENT" ? 404 : 500, { error: "File not found" });
    response.writeHead(200, {
      "content-type": MIME_TYPES[path.extname(localPath)] || "application/octet-stream",
      "cache-control": "no-cache",
      "x-content-type-options": "nosniff",
    });
    response.end(content);
  });
}

http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  if (request.method === "POST" && url.pathname === "/api/mantle-rpc") return proxyRpc(request, response);
  const dexMatch = request.method === "GET" && url.pathname.match(/^\/api\/dex\/(0x[a-fA-F0-9]{40})$/);
  if (dexMatch) return proxyDex(dexMatch[1], response);
  if (request.method === "GET") return serveFile(url.pathname, response);
  return json(response, 405, { error: "Method not allowed" });
}).listen(PORT, "127.0.0.1", () => {
  console.log(`Mantle Distribution Lens is ready at http://127.0.0.1:${PORT}`);
  console.log(`Mantle RPC pool: ${RPC_POOL.map((endpoint) => endpoint.label).join(", ")}`);
});
