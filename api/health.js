/**
 * Vercel Serverless Function — /api/health
 * Simple health check endpoint
 */
export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    status:    "ok",
    service:   "DeployPage API",
    network:   "base-sepolia",
    chainId:   84532,
    timestamp: new Date().toISOString(),
    contract:  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "not-deployed-yet",
  });
}
