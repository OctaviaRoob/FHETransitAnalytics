const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Get deployment network from environment or hardhat config
  const deployNetwork = process.env.DEPLOY_NETWORK || hre.network.name;

  console.log("=".repeat(70));
  console.log("🚀 Deploying ConfidentialTransitAnalytics with FHE Support");
  console.log("=".repeat(70));
  console.log("\n🌍 Deployment Configuration:");
  console.log("   ENV DEPLOY_NETWORK:", process.env.DEPLOY_NETWORK || "(not set, using hardhat default)");
  console.log("   Active Network:", hre.network.name);

  console.log("\n📡 Network Information:");
  console.log("   Network Name:", hre.network.name);
  console.log("   Chain ID:", hre.network.config.chainId);
  console.log("   RPC URL:", hre.network.config.url || "default");

  // Check FHE support
  const isFhevmNetwork = hre.network.name === "zama" || hre.network.name === "zamaTestnet";
  console.log("\n🔐 FHE Support:");
  if (isFhevmNetwork) {
    console.log("   ✅ Full FHE encryption support available");
    console.log("   ✅ Gateway decryption available");
    console.log("   ✅ All encrypted operations fully functional");
  } else {
    console.log("   ⚠️  Limited FHE support on", hre.network.name);
    console.log("   ⚠️  Contract will deploy but FHE features may not work");
    console.log("   💡 Use Zama networks (zama/zamaTestnet) for full FHE support");
  }

  console.log("\n👤 Deployer Information:");
  console.log("   Address:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("   Balance:", hre.ethers.formatEther(balance), "ETH");

  // Check balance
  if (balance === 0n) {
    console.log("\n⚠️  WARNING: Deployer has 0 ETH balance!");
    console.log("   Please fund the deployer address before deployment.");
    process.exit(1);
  }

  console.log("\n🏗️  Compiling contracts...");
  await hre.run("compile");

  console.log("\n🚀 Deploying contract...");
  const Contract = await hre.ethers.getContractFactory("ConfidentialTransitAnalytics");

  console.log("   Contract size:", Contract.bytecode.length / 2 - 1, "bytes");

  const contract = await Contract.deploy();
  console.log("   Transaction hash:", contract.deploymentTransaction().hash);
  console.log("   Waiting for confirmations...");

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("\n" + "=".repeat(70));
  console.log("✅ Deployment Successful!");
  console.log("=".repeat(70));

  console.log("\n📜 Contract Information:");
  console.log("   Contract Address:", address);
  console.log("   Deployer:", deployer.address);
  console.log("   Network:", hre.network.name);
  console.log("   Chain ID:", hre.network.config.chainId);
  console.log("   Block Number:", await hre.ethers.provider.getBlockNumber());
  console.log("   Transaction:", contract.deploymentTransaction().hash);

  // Verify initial state
  console.log("\n🔍 Verifying Initial State:");
  try {
    const transitAuthority = await contract.transitAuthority();
    const currentPeriod = await contract.currentPeriod();
    const isPauser = await contract.isPauser(deployer.address);
    const contractStatus = await contract.getContractStatus();
    const currentHour = await contract.getCurrentAdjustedHour();

    console.log("   Transit Authority:", transitAuthority);
    console.log("   Current Period:", currentPeriod.toString());
    console.log("   Deployer is Pauser:", isPauser);
    console.log("   Contract Paused:", contractStatus[0]);
    console.log("   Current Hour (UTC+3):", currentHour.toString());
    console.log("   Is Odd Hour:", await contract.isOddHourWindow());
    console.log("   Is Even Hour:", await contract.isEvenHourWindow());
  } catch (error) {
    console.log("   ⚠️  Could not verify initial state:", error.message);
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contractAddress: address,
    deployer: deployer.address,
    deploymentBlock: await hre.ethers.provider.getBlockNumber(),
    deploymentTx: contract.deploymentTransaction().hash,
    timestamp: new Date().toISOString(),
    compiler: "0.8.24",
    contractName: "ConfidentialTransitAnalytics"
  };

  const deploymentDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentFile);

  // Network-specific instructions
  console.log("\n📝 Next Steps:");
  console.log("   1. Update CONTRACT_ADDRESS in public/config.js to:", address);

  if (hre.network.name === "sepolia") {
    console.log("   2. Verify contract on Etherscan:");
    console.log("      npm run verify:sepolia", address);
    console.log("   3. View on Etherscan:");
    console.log("      https://sepolia.etherscan.io/address/" + address);
  } else if (hre.network.name === "zama" || hre.network.name === "zamaTestnet") {
    console.log("   2. Contract deployed to Zama fhEVM network");
    console.log("   3. FHE operations are fully enabled");
  }

  console.log("   4. Initialize first period during odd hour (UTC+3):");
  console.log("      npm run interact -- init");
  console.log("   5. Simulate usage:");
  console.log("      npm run simulate");

  console.log("\n🔐 Privacy Features Enabled:");
  console.log("   ✓ Fully Homomorphic Encryption (FHE)");
  console.log("   ✓ Multiple encrypted types (euint8, euint32, ebool)");
  console.log("   ✓ Gateway integration for secure decryption");
  console.log("   ✓ Input proof verification (ZKPoK)");
  console.log("   ✓ Pausable mechanism");
  console.log("   ✓ Fail-closed design");
  console.log("   ✓ Time-windowed operations (UTC+3)");

  console.log("\n🔗 Useful Links:");
  if (hre.network.name === "sepolia") {
    console.log("   Contract:", "https://sepolia.etherscan.io/address/" + address);
    console.log("   Deployer:", "https://sepolia.etherscan.io/address/" + deployer.address);
  }

  console.log("\n" + "=".repeat(70));
  console.log("🎉 Deployment Complete!");
  console.log("=".repeat(70) + "\n");

  return {
    contractAddress: address,
    deployer: deployer.address,
    network: hre.network.name
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exitCode = 1;
  });