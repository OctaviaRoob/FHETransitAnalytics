const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Verify deployed contract on Etherscan
 * Usage: node scripts/verify.js [network] [contractAddress]
 * Example: node scripts/verify.js sepolia 0x1234...
 */

async function main() {
  const args = process.argv.slice(2);
  let network = args[0] || hre.network.name;
  let contractAddress = args[1];

  console.log("=".repeat(70));
  console.log("🔍 Contract Verification Script");
  console.log("=".repeat(70));

  // If no contract address provided, try to load from deployment file
  if (!contractAddress) {
    const deploymentFile = path.join(__dirname, "..", "deployments", `${network}.json`);

    if (fs.existsSync(deploymentFile)) {
      const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
      contractAddress = deploymentData.contractAddress;
      console.log("\n📄 Loaded deployment info from:", deploymentFile);
      console.log("   Contract Address:", contractAddress);
      console.log("   Network:", deploymentData.network);
      console.log("   Deployed at:", deploymentData.timestamp);
    } else {
      console.error("\n❌ Error: No contract address provided and no deployment file found");
      console.log("\nUsage:");
      console.log("  node scripts/verify.js [network] [contractAddress]");
      console.log("\nExamples:");
      console.log("  node scripts/verify.js sepolia 0x1234...");
      console.log("  npm run verify:sepolia 0x1234...");
      process.exit(1);
    }
  }

  console.log("\n📡 Verification Details:");
  console.log("   Network:", network);
  console.log("   Contract Address:", contractAddress);
  console.log("   Contract Name: ConfidentialTransitAnalytics");

  // Check if network supports verification
  if (network !== "sepolia" && network !== "mainnet" && network !== "goerli") {
    console.log("\n⚠️  Warning: Etherscan verification only works on public Ethereum networks");
    console.log("   Networks: sepolia, goerli, mainnet");
    console.log("   Current network:", network, "does not support Etherscan verification");
    process.exit(0);
  }

  // Verify the contract has been deployed
  console.log("\n🔄 Checking if contract is deployed...");
  try {
    const code = await hre.ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.error("\n❌ Error: No contract found at address", contractAddress);
      console.log("   Please check the contract address and network");
      process.exit(1);
    }
    console.log("   ✅ Contract found at address");
  } catch (error) {
    console.error("\n❌ Error checking contract:", error.message);
    process.exit(1);
  }

  console.log("\n🚀 Starting verification process...");
  console.log("   This may take a few minutes...");

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // No constructor arguments for this contract
      contract: "contracts/ConfidentialTransitAnalytics.sol:ConfidentialTransitAnalytics"
    });

    console.log("\n" + "=".repeat(70));
    console.log("✅ Contract Verified Successfully!");
    console.log("=".repeat(70));

    console.log("\n🔗 View Contract:");
    if (network === "sepolia") {
      console.log("   https://sepolia.etherscan.io/address/" + contractAddress + "#code");
    } else if (network === "mainnet") {
      console.log("   https://etherscan.io/address/" + contractAddress + "#code");
    } else if (network === "goerli") {
      console.log("   https://goerli.etherscan.io/address/" + contractAddress + "#code");
    }

    console.log("\n📝 Verified Features:");
    console.log("   ✓ Source code is now publicly viewable");
    console.log("   ✓ Contract ABI is available");
    console.log("   ✓ Read/Write functions accessible on Etherscan");
    console.log("   ✓ Contract is trustless and transparent");

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✅ Contract is already verified!");

      if (network === "sepolia") {
        console.log("\n🔗 View on Etherscan:");
        console.log("   https://sepolia.etherscan.io/address/" + contractAddress + "#code");
      }
    } else {
      console.error("\n❌ Verification failed:");
      console.error(error.message);

      console.log("\n💡 Troubleshooting:");
      console.log("   1. Make sure ETHERSCAN_API_KEY is set in .env file");
      console.log("   2. Wait a few minutes after deployment before verifying");
      console.log("   3. Check that the contract address is correct");
      console.log("   4. Ensure you're using the correct network");

      process.exitCode = 1;
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("Verification Complete!");
  console.log("=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script failed:");
    console.error(error);
    process.exitCode = 1;
  });
