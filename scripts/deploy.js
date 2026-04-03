const { ethers, network, run } = require("hardhat");

async function main() {
  console.log("─────────────────────────────────────────");
  console.log("  DeployPage — Smart Contract Deployment");
  console.log("  Network:", network.name);
  console.log("─────────────────────────────────────────");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("\n⚠  Deployer has 0 ETH. Get Base Sepolia ETH from:");
    console.error("   https://www.coinbase.com/faucets/base-ethereum-goerli-faucet");
    console.error("   https://faucet.quicknode.com/base/sepolia");
    process.exit(1);
  }

  console.log("\nDeploying DeployPage contract...");
  const DeployPage = await ethers.getContractFactory("DeployPage");
  const contract   = await DeployPage.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅ DeployPage deployed to:", address);
  console.log("   Block explorer: https://sepolia.basescan.org/address/" + address);

  // Save deployment info
  const fs   = require("fs");
  const path = require("path");
  const info = {
    network:     network.name,
    chainId:     84532,
    address,
    deployer:    deployer.address,
    timestamp:   new Date().toISOString(),
    blockNumber: (await contract.deploymentTransaction().wait()).blockNumber,
  };

  const deployDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deployDir)) fs.mkdirSync(deployDir, { recursive: true });
  fs.writeFileSync(
    path.join(deployDir, `${network.name}.json`),
    JSON.stringify(info, null, 2)
  );
  console.log("\n📄 Deployment info saved to deployments/" + network.name + ".json");

  // Attempt verification (non-blocking)
  if (process.env.BASESCAN_API_KEY && process.env.BASESCAN_API_KEY !== "PLACEHOLDER") {
    console.log("\nWaiting 15s for Basescan to index the contract...");
    await new Promise(r => setTimeout(r, 15000));
    try {
      await run("verify:verify", { address, constructorArguments: [] });
      console.log("✅ Contract verified on Basescan");
    } catch (e) {
      console.log("ℹ  Verification skipped:", e.message);
    }
  }

  console.log("\n─────────────────────────────────────────");
  console.log("  Deployment complete!");
  console.log("─────────────────────────────────────────");
}

main().catch((err) => { console.error(err); process.exit(1); });
