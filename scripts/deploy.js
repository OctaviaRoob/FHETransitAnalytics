const hre = require("hardhat");

async function main() {
  console.log("Deploying ConfidentialTransitAnalytics contract to", hre.network.name, "...");

  const Contract = await hre.ethers.getContractFactory("ConfidentialTransitAnalytics");
  const contract = await Contract.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("\n✅ Contract deployed successfully!");
  console.log("Contract address:", address);
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  console.log("\n📝 Update the CONTRACT_ADDRESS in public/index.html to:", address);
  console.log("\n🔐 Privacy Method: Commitment scheme (hash-based privacy)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});