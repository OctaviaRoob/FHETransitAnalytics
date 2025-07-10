const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// 合约 ABI (只包含需要的函数)
const CONTRACT_ABI = [
  "function transitAuthority() view returns (address)",
  "function currentPeriod() view returns (uint32)",
  "function paused() view returns (bool)",
  "function pauserCount() view returns (uint256)",
  "function getCurrentAdjustedHour() view returns (uint256)",
  "function isOddHourWindow() view returns (bool)",
  "function isEvenHourWindow() view returns (bool)",
  "function isSubmissionActive() view returns (bool)",
  "function isAnalysisActive() view returns (bool)",
  "function getCurrentPeriodInfo() view returns (uint32, bool, bool, uint256, uint256)",
  "function isPauser(address) view returns (bool)",
  "function getContractStatus() view returns (bool, uint256, uint32)"
];

async function main() {
  console.log("=".repeat(70));
  console.log("🔧 Simple Contract Interaction Tool");
  console.log("=".repeat(70));

  // 读取部署信息
  const deploymentFile = path.join(__dirname, "..", "deployments", "sepolia.json");
  if (!fs.existsSync(deploymentFile)) {
    console.error("\n❌ No deployment found for Sepolia");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  console.log("\n📡 Network: sepolia");
  console.log("📜 Contract:", deployment.contractAddress);

  // 设置 provider
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
  console.log("🌐 RPC:", rpcUrl);

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // 连接合约
  const contract = new ethers.Contract(
    deployment.contractAddress,
    CONTRACT_ABI,
    provider
  );

  console.log("\n" + "=".repeat(70));
  console.log("📊 Contract Status\n");

  try {
    // 获取状态
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

    console.log("\n✅ Contract is accessible and responding!");

  } catch (error) {
    console.error("\n❌ Error querying contract:");
    console.error("  ", error.message);

    // 测试连接
    try {
      const blockNumber = await provider.getBlockNumber();
      console.log("\n✅ RPC connection is OK (Block:", blockNumber, ")");
      console.log("❌ Contract may not be deployed at this address");
    } catch (rpcError) {
      console.log("\n❌ RPC connection failed");
    }
  }

  console.log("\n" + "=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exitCode = 1;
  });
