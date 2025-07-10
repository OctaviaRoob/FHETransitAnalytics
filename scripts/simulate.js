const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Simulate full workflow of ConfidentialTransitAnalytics
 * This script demonstrates:
 * - Period initialization
 * - Multiple users submitting data
 * - Analysis and results retrieval
 */

async function loadDeployment(network) {
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ No deployment found for network:", network);
    console.log("\nPlease deploy the contract first:");
    console.log("  npm run deploy");
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("=".repeat(70));
  console.log("🎭 Contract Simulation Script");
  console.log("=".repeat(70));

  // Load deployment info
  const deployment = await loadDeployment(hre.network.name);
  console.log("\n📡 Network:", hre.network.name);
  console.log("📜 Contract:", deployment.contractAddress);

  // Get signers
  const signers = await hre.ethers.getSigners();
  console.log("👥 Available Signers:", signers.length);

  // Get contract instance
  const Contract = await hre.ethers.getContractFactory("ConfidentialTransitAnalytics");
  const contract = Contract.attach(deployment.contractAddress);

  console.log("\n" + "=".repeat(70));
  console.log("Starting Simulation...");
  console.log("=".repeat(70));

  try {
    // Step 1: Check current status
    console.log("\n📊 Step 1: Checking Current Status");
    await checkStatus(contract);

    // Step 2: Initialize period (if needed)
    console.log("\n🔄 Step 2: Initialize Period");
    const periodInfo = await contract.getCurrentPeriodInfo();

    if (!periodInfo[1] || periodInfo[2]) {
      const isOddHour = await contract.isOddHourWindow();

      if (!isOddHour) {
        console.log("⚠️  Not in odd hour window. Cannot initialize period.");
        const currentHour = await contract.getCurrentAdjustedHour();
        console.log("   Current Hour (UTC+3):", currentHour.toString());
        console.log("   Next odd hours: 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23");
        console.log("\n💡 Skipping initialization step");
      } else {
        await initializePeriod(contract, signers[0]);
      }
    } else {
      console.log("✅ Period already initialized");
      console.log("   Period:", periodInfo[0].toString());
    }

    // Step 3: Submit data from multiple users
    console.log("\n📝 Step 3: Simulate Multiple Users Submitting Data");

    const submissionActive = await contract.isSubmissionActive();
    if (!submissionActive) {
      console.log("⚠️  Submission window not active");
      console.log("   Skipping data submission");
    } else {
      const users = [
        { signer: signers[0], spending: 500, rides: 10, name: "User 1" },
        { signer: signers[1] || signers[0], spending: 750, rides: 15, name: "User 2" },
        { signer: signers[2] || signers[0], spending: 300, rides: 6, name: "User 3" },
        { signer: signers[3] || signers[0], spending: 1000, rides: 20, name: "User 4" },
        { signer: signers[4] || signers[0], spending: 400, rides: 8, name: "User 5" }
      ];

      for (let i = 0; i < Math.min(users.length, signers.length); i++) {
        const user = users[i];

        // Check if already submitted
        const status = await contract.getCardDataStatus(user.signer.address);
        if (status[0]) {
          console.log(`   ⏭️  ${user.name} already submitted data`);
          continue;
        }

        await submitData(contract, user.signer, user.spending, user.rides, user.name);
        await sleep(1000); // Wait 1 second between submissions
      }
    }

    // Step 4: Display aggregated data (encrypted)
    console.log("\n🔐 Step 4: Current Period Status");
    const updatedPeriodInfo = await contract.getCurrentPeriodInfo();
    console.log("   Period:", updatedPeriodInfo[0].toString());
    console.log("   Participants:", updatedPeriodInfo[4].toString());
    console.log("   Data Collected:", updatedPeriodInfo[1]);
    console.log("   Period Closed:", updatedPeriodInfo[2]);
    console.log("\n   ℹ️  Individual data remains encrypted");
    console.log("   ℹ️  Only aggregates will be revealed after analysis");

    // Step 5: Perform analysis (if in even hour)
    console.log("\n🔍 Step 5: Perform Analysis");
    const analysisActive = await contract.isAnalysisActive();

    if (!analysisActive) {
      console.log("⚠️  Analysis window not active");
      const isEvenHour = await contract.isEvenHourWindow();
      const currentHour = await contract.getCurrentAdjustedHour();
      console.log("   Current Hour (UTC+3):", currentHour.toString());
      console.log("   Is Even Hour:", isEvenHour);
      console.log("   Next even hours: 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22");
      console.log("\n💡 To complete analysis, run this script during an even hour");
    } else {
      if (!updatedPeriodInfo[2]) {
        await performAnalysis(contract, signers[0]);
        console.log("\n⏳ Waiting for decryption oracle...");
        console.log("   This may take a few minutes");
        console.log("   Run this script again later to see results");
      } else {
        console.log("✅ Period already analyzed");
      }
    }

    // Step 6: View results (if available)
    console.log("\n📈 Step 6: View Results");
    const finalPeriodInfo = await contract.getCurrentPeriodInfo();

    if (finalPeriodInfo[2]) {
      await viewResults(contract, finalPeriodInfo[0]);
    } else {
      console.log("⏳ Results not available yet");
      console.log("   Analysis must be completed first");
      console.log("   Check back after the decryption oracle processes the request");
    }

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("✅ Simulation Complete!");
    console.log("=".repeat(70));

    console.log("\n📊 Summary:");
    console.log("   Network:", hre.network.name);
    console.log("   Contract:", deployment.contractAddress);
    console.log("   Current Period:", finalPeriodInfo[0].toString());
    console.log("   Participants:", finalPeriodInfo[4].toString());
    console.log("   Period Closed:", finalPeriodInfo[2]);

    console.log("\n💡 Next Steps:");
    console.log("   - Use 'npm run interact -- status' to check status");
    console.log("   - Use 'npm run interact -- period <number>' to view period history");
    console.log("   - Use 'npm run interact -- init' to start a new period (odd hours)");
    console.log("   - Use 'npm run interact -- analyze' to analyze data (even hours)");

  } catch (error) {
    console.error("\n❌ Simulation error:", error.message);
    if (error.reason) {
      console.error("   Reason:", error.reason);
    }
    process.exitCode = 1;
  }

  console.log("\n" + "=".repeat(70) + "\n");
}

async function checkStatus(contract) {
  const status = await contract.getContractStatus();
  const periodInfo = await contract.getCurrentPeriodInfo();
  const currentHour = await contract.getCurrentAdjustedHour();

  console.log("   Contract Paused:", status[0]);
  console.log("   Current Period:", status[2].toString());
  console.log("   Current Hour (UTC+3):", currentHour.toString());
  console.log("   Participants:", periodInfo[4].toString());
}

async function initializePeriod(contract, signer) {
  console.log("   Initializing new period...");

  const tx = await contract.connect(signer).initializePeriod();
  console.log("   Transaction:", tx.hash);

  const receipt = await tx.wait();
  console.log("   ✅ Period initialized in block:", receipt.blockNumber);
}

async function submitData(contract, signer, spending, rides, userName) {
  console.log(`   ${userName}: Submitting data (${spending} cents, ${rides} rides)...`);

  try {
    const tx = await contract.connect(signer).submitCardDataPlain(spending, rides);
    const receipt = await tx.wait();
    console.log(`   ✅ ${userName}: Data submitted in block ${receipt.blockNumber}`);
  } catch (error) {
    if (error.message.includes("DataAlreadySubmitted")) {
      console.log(`   ⏭️  ${userName}: Already submitted data this period`);
    } else {
      console.log(`   ❌ ${userName}: Failed - ${error.message}`);
    }
  }
}

async function performAnalysis(contract, signer) {
  console.log("   Requesting analysis...");

  const tx = await contract.connect(signer).performAnalysis();
  console.log("   Transaction:", tx.hash);

  const receipt = await tx.wait();
  console.log("   ✅ Analysis requested in block:", receipt.blockNumber);
}

async function viewResults(contract, periodNumber) {
  const history = await contract.getPeriodHistory(periodNumber);

  console.log("   Period:", periodNumber.toString());
  console.log("   Total Revenue:", history[1].toString(), "cents ($" + (history[1] / 100).toFixed(2) + ")");
  console.log("   Total Rides:", history[2].toString());
  console.log("   Participants:", history[5].toString());

  if (history[5] > 0) {
    const avgSpending = await contract.getAverageSpending(periodNumber);
    const avgRides = await contract.getAverageRides(periodNumber);
    console.log("   Average Spending:", avgSpending.toString(), "cents ($" + (avgSpending / 100).toFixed(2) + ")");
    console.log("   Average Rides:", avgRides.toString());
  }

  console.log("\n   🔐 Privacy Preserved:");
  console.log("   - Individual spending amounts remain encrypted");
  console.log("   - Individual ride counts remain encrypted");
  console.log("   - Only aggregate totals are revealed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script failed:");
    console.error(error);
    process.exitCode = 1;
  });
