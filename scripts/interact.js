/**
 * interact.js — Example script to interact with the deployed DeployPage contract
 * Usage: npx hardhat run scripts/interact.js --network base-sepolia
 */
const { ethers } = require("hardhat");
const fs   = require("fs");
const path = require("path");

async function main() {
  const deploymentFile = path.join(__dirname, "../deployments/base-sepolia.json");
  if (!fs.existsSync(deploymentFile)) {
    console.error("No deployment found. Run: npx hardhat run scripts/deploy.js --network base-sepolia");
    process.exit(1);
  }

  const { address } = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  console.log("Using contract at:", address);

  const [signer] = await ethers.getSigners();
  const DeployPage = await ethers.getContractFactory("DeployPage");
  const contract   = DeployPage.attach(address);

  // --- Example: create a page ---
  const sampleContract = "0xd3f4a8c6e2b1f97a3d5e0c8b4a2f6e9d1c7b3a50";
  console.log("\nCreating a sample page...");
  const tx = await contract.createPage(
    sampleContract,
    "SampleToken",
    "A next-generation decentralized token built on Base.",
    "SMPL",
    "ERC-20",
    "Launch App",
    "https://deploypage.xyz"
  );
  await tx.wait();
  console.log("✅ Page created! Tx:", tx.hash);

  // --- Read the page back ---
  const page = await contract.getPage(sampleContract);
  console.log("\nPage data:");
  console.log("  Title:      ", page.title);
  console.log("  Symbol:     ", page.symbol);
  console.log("  Type:       ", page.pageType);
  console.log("  Active:     ", page.active);
  console.log("  Created at: ", new Date(Number(page.createdAt) * 1000).toISOString());

  // --- Total pages ---
  const total = await contract.totalPages();
  console.log("\nTotal registered pages:", total.toString());
}

main().catch((err) => { console.error(err); process.exit(1); });
