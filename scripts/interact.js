const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Interact with deployed ConfidentialTransitAnalytics contract
 * Usage: node scripts/interact.js [command] [args...]
 *
 * Commands:
 *   status              - Get contract status
 *   init                - Initialize new period
 *   submit <spending> <rides> - Submit card data
 *   analyze             - Perform analysis
 *   period <number>     - Get period history
 *   pause               - Pause contract
 *   unpause             - Unpause contract
 */

async function loadDeployment(network) {
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ No deployment found for network:", network);
    console.log("\nAvailable deployments:");
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (fs.existsSync(deploymentsDir)) {
      const files = fs.readdirSync(deploymentsDir);
      files.forEach(file => console.log("  -", file.replace(".json", "")));
    }
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "status";

  console.log("=".repeat(70));
  console.log("🔧 Contract Interaction Script");
  console.log("=".repeat(70));

  // Load deployment info
  const deployment = await loadDeployment(hre.network.name);
  console.log("\n📡 Network:", hre.network.name);
  console.log("📜 Contract:", deployment.contractAddress);

  // Get contract instance
  const [signer] = await hre.ethers.getSigners();
  console.log("👤 Signer:", signer.address);

  const Contract = await hre.ethers.getContractFactory("ConfidentialTransitAnalytics");
  const contract = Contract.attach(deployment.contractAddress);

  console.log("\n" + "=".repeat(70));

  try {
    switch (command) {
      case "status":
        await getStatus(contract);
        break;

      case "init":
        await initializePeriod(contract, signer);
        break;

      case "submit":
        const spending = parseInt(args[1]) || 500;
        const rides = parseInt(args[2]) || 10;
        await submitData(contract, signer, spending, rides);
        break;

      case "analyze":
        await performAnalysis(contract, signer);
        break;

      case "period":
        const periodNumber = parseInt(args[1]) || 1;
        await getPeriodHistory(contract, periodNumber);
        break;

      case "pause":
        await pauseContract(contract, signer);
        break;

      case "unpause":
        await unpauseContract(contract, signer);
        break;

      case "help":
        showHelp();
        break;

      default:
        console.log("❌ Unknown command:", command);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.reason) {
      console.error("   Reason:", error.reason);
    }
    process.exitCode = 1;
  }

  console.log("\n" + "=".repeat(70) + "\n");
}

async function getStatus(contract) {
  console.log("📊 Contract Status\n");

  const status = await contract.getContractStatus();
  const periodInfo = await contract.getCurrentPeriodInfo();
  const currentHour = await contract.getCurrentAdjustedHour();
  const isOddHour = await contract.isOddHourWindow();
  const isEvenHour = await contract.isEvenHourWindow();
  const submissionActive = await contract.isSubmissionActive();
  const analysisActive = await contract.isAnalysisActive();

  console.log("General:");
  console.log("  Paused:", status[0]);
  console.log("  Pauser Count:", status[1].toString());
  console.log("  Current Period:", status[2].toString());

  console.log("\nTime Windows (UTC+3):");
  console.log("  Current Hour:", currentHour.toString());
  console.log("  Is Odd Hour:", isOddHour);
  console.log("  Is Even Hour:", isEvenHour);
  console.log("  Submission Active:", submissionActive);
  console.log("  Analysis Active:", analysisActive);

  console.log("\nCurrent Period:");
  console.log("  Period Number:", periodInfo[0].toString());
  console.log("  Data Collected:", periodInfo[1]);
  console.log("  Period Closed:", periodInfo[2]);
  console.log("  Start Time:", new Date(Number(periodInfo[3]) * 1000).toISOString());
  console.log("  Participants:", periodInfo[4].toString());

  // If period is closed, show results
  if (periodInfo[2]) {
    const history = await contract.getPeriodHistory(periodInfo[0]);
    console.log("\nPeriod Results:");
    console.log("  Total Revenue:", history[1].toString(), "cents ($" + (history[1] / 100).toFixed(2) + ")");
    console.log("  Total Rides:", history[2].toString());
    console.log("  End Time:", new Date(Number(history[4]) * 1000).toISOString());

    if (history[5] > 0) {
      const avgSpending = await contract.getAverageSpending(periodInfo[0]);
      const avgRides = await contract.getAverageRides(periodInfo[0]);
      console.log("  Average Spending:", avgSpending.toString(), "cents ($" + (avgSpending / 100).toFixed(2) + ")");
      console.log("  Average Rides:", avgRides.toString());
    }
  }
}

async function initializePeriod(contract, signer) {
  console.log("🔄 Initializing New Period\n");

  const isOddHour = await contract.isOddHourWindow();
  if (!isOddHour) {
    console.log("⚠️  Warning: Not in odd hour window (UTC+3)");
    const currentHour = await contract.getCurrentAdjustedHour();
    console.log("   Current Hour:", currentHour.toString());
    console.log("   Please try during odd hours: 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23");
  }

  console.log("Sending transaction...");
  const tx = await contract.initializePeriod();
  console.log("  Transaction hash:", tx.hash);
  console.log("  Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("  ✅ Confirmed in block:", receipt.blockNumber);

  // Get new period info
  const periodInfo = await contract.getCurrentPeriodInfo();
  console.log("\n✅ Period Initialized!");
  console.log("  Period Number:", periodInfo[0].toString());
  console.log("  Start Time:", new Date(Number(periodInfo[3]) * 1000).toISOString());
}

async function submitData(contract, signer, spending, rides) {
  console.log("📝 Submitting Card Data\n");

  console.log("Data:");
  console.log("  Spending:", spending, "cents ($" + (spending / 100).toFixed(2) + ")");
  console.log("  Rides:", rides);

  const submissionActive = await contract.isSubmissionActive();
  if (!submissionActive) {
    console.log("\n⚠️  Warning: Submission window not active");
    console.log("   Make sure a period is initialized and you're in odd hour window");
  }

  console.log("\nSending transaction...");
  const tx = await contract.submitCardDataPlain(spending, rides);
  console.log("  Transaction hash:", tx.hash);
  console.log("  Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("  ✅ Confirmed in block:", receipt.blockNumber);

  console.log("\n✅ Data Submitted!");
  console.log("  Your data is now encrypted and aggregated");
}

async function performAnalysis(contract, signer) {
  console.log("🔍 Performing Analysis\n");

  const analysisActive = await contract.isAnalysisActive();
  if (!analysisActive) {
    console.log("⚠️  Warning: Analysis window not active");
    const currentHour = await contract.getCurrentAdjustedHour();
    console.log("   Current Hour:", currentHour.toString());
    console.log("   Please try during even hours: 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22");
  }

  console.log("Sending transaction...");
  const tx = await contract.performAnalysis();
  console.log("  Transaction hash:", tx.hash);
  console.log("  Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("  ✅ Confirmed in block:", receipt.blockNumber);

  console.log("\n✅ Analysis Requested!");
  console.log("  Gateway will decrypt aggregated results");
  console.log("  Check status in a few minutes to see results");
}

async function getPeriodHistory(contract, periodNumber) {
  console.log(`📖 Period ${periodNumber} History\n`);

  const history = await contract.getPeriodHistory(periodNumber);

  if (!history[0]) {
    console.log("⚠️  Period not closed yet or doesn't exist");
    return;
  }

  console.log("Period Results:");
  console.log("  Period Closed:", history[0]);
  console.log("  Total Revenue:", history[1].toString(), "cents ($" + (history[1] / 100).toFixed(2) + ")");
  console.log("  Total Rides:", history[2].toString());
  console.log("  Start Time:", new Date(Number(history[3]) * 1000).toISOString());
  console.log("  End Time:", new Date(Number(history[4]) * 1000).toISOString());
  console.log("  Participants:", history[5].toString());

  if (history[5] > 0) {
    const avgSpending = await contract.getAverageSpending(periodNumber);
    const avgRides = await contract.getAverageRides(periodNumber);
    console.log("\nAverages:");
    console.log("  Average Spending:", avgSpending.toString(), "cents ($" + (avgSpending / 100).toFixed(2) + ")");
    console.log("  Average Rides:", avgRides.toString());
  }
}

async function pauseContract(contract, signer) {
  console.log("⏸️  Pausing Contract\n");

  const isPauser = await contract.isPauser(signer.address);
  if (!isPauser) {
    console.log("❌ Error: You are not authorized to pause the contract");
    console.log("   Only pausers can pause the contract");
    return;
  }

  console.log("Sending transaction...");
  const tx = await contract.pause();
  console.log("  Transaction hash:", tx.hash);
  console.log("  Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("  ✅ Confirmed in block:", receipt.blockNumber);

  console.log("\n✅ Contract Paused!");
}

async function unpauseContract(contract, signer) {
  console.log("▶️  Unpausing Contract\n");

  const isPauser = await contract.isPauser(signer.address);
  if (!isPauser) {
    console.log("❌ Error: You are not authorized to unpause the contract");
    console.log("   Only pausers can unpause the contract");
    return;
  }

  console.log("Sending transaction...");
  const tx = await contract.unpause();
  console.log("  Transaction hash:", tx.hash);
  console.log("  Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("  ✅ Confirmed in block:", receipt.blockNumber);

  console.log("\n✅ Contract Unpaused!");
}

function showHelp() {
  console.log("\n📚 Available Commands:\n");
  console.log("  status                      - Get contract status");
  console.log("  init                        - Initialize new period");
  console.log("  submit <spending> <rides>   - Submit card data");
  console.log("  analyze                     - Perform analysis");
  console.log("  period <number>             - Get period history");
  console.log("  pause                       - Pause contract");
  console.log("  unpause                     - Unpause contract");
  console.log("  help                        - Show this help");
  console.log("\nExamples:");
  console.log("  npm run interact -- status");
  console.log("  npm run interact -- init");
  console.log("  npm run interact -- submit 500 10");
  console.log("  npm run interact -- analyze");
  console.log("  npm run interact -- period 1");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script failed:");
    console.error(error);
    process.exitCode = 1;
  });
