/*
 * Publishes the official xStocks deployment catalog for Mantle only.
 * It does not claim that every listed asset has a live public market.
 */
const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(ROOT, "data", "catalog", "xstocks-mantle.json");
const SOURCE_URL = "https://api.backed.fi/rest/tokens/wrappers?businessLine=xStocks";

function normalizeAddress(value) {
  return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value) ? value.toLowerCase() : null;
}

async function main() {
  const response = await fetch(SOURCE_URL, { headers: { "user-agent": "MantleDistributionLens/7.0" } });
  if (!response.ok) throw new Error(`xStocks catalog returned HTTP ${response.status}`);
  const payload = await response.json();
  const assets = (payload.tokens || []).flatMap((token) => (token.deployments || [])
    .filter((deployment) => Number(deployment.chainId) === 5000 || deployment.network === "Mantle")
    .map((deployment) => ({
      id: `${token.symbol.toLowerCase()}-mantle`,
      name: token.name,
      symbol: token.symbol,
      address: normalizeAddress(deployment.address),
      decimals: Number(deployment.decimals || 18),
      wrappers: (deployment.wrappers || []).map((wrapper) => ({ address: normalizeAddress(wrapper.address), type: wrapper.type })).filter((wrapper) => wrapper.address),
    }))
  ).filter((asset) => asset.address).sort((left, right) => left.symbol.localeCompare(right.symbol));

  const catalog = {
    schema: 1,
    generatedAt: new Date().toISOString(),
    source: {
      name: "xStocks / Backed official deployment catalog",
      url: SOURCE_URL,
      legalOverview: "https://docs.xstocks.fi/docs/product-legal-overview",
      note: "Official deployments on Mantle. Listing here does not itself prove a live market, liquidity, or investor eligibility.",
    },
    network: { name: "Mantle", chainId: 5000 },
    assetCount: assets.length,
    assets,
  };
  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  console.log(`Published ${assets.length} official xStocks Mantle deployments.`);
}

main().catch((error) => {
  console.error(`xStocks catalog update failed: ${error.message}`);
  process.exitCode = 1;
});
