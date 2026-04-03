/**
 * Vercel Serverless Function — /api/page
 * Reads DeployPage contract data from Base Sepolia testnet
 *
 * GET  /api/page?address=0x...   → returns page metadata
 * POST /api/page                 → creates a page (requires tx to be sent from frontend)
 */

const CHAIN_ID       = 84532;
const RPC_URL        = process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org";
const CONTRACT_ADDR  = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// Minimal ABI for reading
const ABI_FRAGMENTS = [
  "function getPage(address) view returns (tuple(address contractAddress, string title, string description, string symbol, string pageType, string ctaLabel, string ctaUrl, bool active, uint256 createdAt, uint256 updatedAt))",
  "function totalPages() view returns (uint256)",
  "function getPagesPaginated(uint256 offset, uint256 limit) view returns (address[])",
  "function pageFee() view returns (uint256)",
];

// Simple ABI encoder/caller using fetch (no ethers.js needed in serverless)
async function ethCall(method, params, outputType) {
  const body = {
    jsonrpc: "2.0",
    method:  "eth_call",
    params: [
      {
        to:   CONTRACT_ADDR,
        data: encodeCall(method, params),
      },
      "latest",
    ],
    id: 1,
  };

  const res  = await fetch(RPC_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

// Very minimal ABI encoding for our use-case
function encodeCall(sig, args) {
  // We use a simple approach: encode the selector + args via the function signature
  // For production use a proper ABI encoder; this covers our read paths
  const sigHash = keccak256Prefix(sig);
  if (!args || args.length === 0) return sigHash;

  // Encode a single address argument
  if (args.length === 1 && args[0].startsWith("0x") && args[0].length === 42) {
    return sigHash + args[0].slice(2).toLowerCase().padStart(64, "0");
  }
  return sigHash;
}

function keccak256Prefix(sig) {
  // Pre-computed selectors for our functions (saves a dependency)
  const selectors = {
    "totalPages()":                               "0x793f9e26",
    "pageFee()":                                  "0x3fa4f245",
    "getPage(address)":                           "0x0d5d8ca2",
    "getPagesPaginated(uint256,uint256)":          "0xfcf66fcc",
  };
  const found = Object.keys(selectors).find(k => sig.startsWith(k.split("(")[0]));
  return selectors[found] || "0x";
}

function decodeHex(hex) {
  return parseInt(hex, 16);
}

function decodeString(data, offset) {
  const strOffset = parseInt(data.slice(offset * 2, offset * 2 + 64), 16) * 2;
  const strLen    = parseInt(data.slice(strOffset, strOffset + 64), 16) * 2;
  const strHex    = data.slice(strOffset + 64, strOffset + 64 + strLen);
  return Buffer.from(strHex, "hex").toString("utf8");
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const { address, action } = req.query;

      // Health/info endpoint
      if (action === "info" || !address) {
        const totalHex = await ethCall("totalPages()", []);
        const feeHex   = await ethCall("pageFee()", []);
        return res.status(200).json({
          network:     "base-sepolia",
          chainId:     CHAIN_ID,
          contract:    CONTRACT_ADDR,
          totalPages:  decodeHex(totalHex),
          fee:         decodeHex(feeHex),
          explorer:    "https://sepolia.basescan.org",
          rpc:         "https://sepolia.base.org",
          status:      "testnet",
        });
      }

      // Page lookup
      if (!address.match(/^0x[0-9a-fA-F]{40}$/)) {
        return res.status(400).json({ error: "Invalid address format" });
      }

      if (!CONTRACT_ADDR) {
        return res.status(503).json({
          error:   "Contract not deployed yet",
          message: "Set NEXT_PUBLIC_CONTRACT_ADDRESS env var after running deploy:testnet",
        });
      }

      const data = await ethCall("getPage(address)", [address]);

      if (!data || data === "0x") {
        return res.status(404).json({ error: "Page not found for this address" });
      }

      // Parse the returned tuple (simplified — works for our struct layout)
      const raw = data.startsWith("0x") ? data.slice(2) : data;

      // Slot 0: contractAddress (padded)
      const contractAddress = "0x" + raw.slice(24, 64);

      // Strings are ABI-encoded as dynamic types; offsets start at slot 1
      // For simplicity, return the raw hex and let the client decode if needed
      // In production, use ethers.js AbiCoder for full tuple decoding
      return res.status(200).json({
        contractAddress,
        raw:     data,
        network: "base-sepolia",
        chainId: CHAIN_ID,
        note:    "Use ethers.js AbiCoder to fully decode the tuple on the client side",
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[/api/page] Error:", err.message);
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
}
