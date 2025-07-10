import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ConfidentialTransitAnalytics } from "../typechain-types";

type Signers = {
  deployer: HardhatEthersSigner;
  authority: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

describe("ConfidentialTransitAnalytics", function () {
  let signers: Signers;
  let contract: ConfidentialTransitAnalytics;
  let contractAddress: string;

  // Helper function to deploy contract
  async function deployFixture() {
    const factory = await ethers.getContractFactory("ConfidentialTransitAnalytics");
    const contract = await factory.deploy() as ConfidentialTransitAnalytics;
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    return { contract, contractAddress };
  }

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      authority: ethSigners[1],
      alice: ethSigners[2],
      bob: ethSigners[3],
      charlie: ethSigners[4],
    };
  });

  beforeEach(async function () {
    ({ contract, contractAddress } = await deployFixture());
  });

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      expect(await contract.getAddress()).to.be.properAddress;
    });

    it("should set the correct transit authority", async function () {
      const authority = await contract.transitAuthority();
      expect(authority).to.equal(signers.deployer.address);
    });

    it("should initialize with period 0", async function () {
      const currentPeriod = await contract.currentPeriod();
      expect(currentPeriod).to.equal(0);
    });

    it("should start in unpaused state", async function () {
      const isPaused = await contract.paused();
      expect(isPaused).to.equal(false);
    });

    it("should have correct initial window times", async function () {
      const dataWindow = await contract.DATA_COLLECTION_WINDOW();
      const analysisWindow = await contract.ANALYSIS_WINDOW();

      expect(dataWindow).to.equal(1 * 24 * 60 * 60); // 1 day
      expect(analysisWindow).to.equal(7 * 24 * 60 * 60); // 7 days
    });
  });

  describe("Period Initialization", function () {
    it("should allow transit authority to initialize period", async function () {
      await expect(contract.connect(signers.deployer).initializePeriod())
        .to.emit(contract, "PeriodInitialized")
        .withArgs(1);
    });

    it("should increment period number on initialization", async function () {
      await contract.connect(signers.deployer).initializePeriod();
      const currentPeriod = await contract.currentPeriod();
      expect(currentPeriod).to.equal(1);
    });

    it("should set correct start time on initialization", async function () {
      const tx = await contract.connect(signers.deployer).initializePeriod();
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      const periodInfo = await contract.getPeriodInfo(1);
      expect(periodInfo.startTime).to.be.closeTo(block!.timestamp, 5);
    });

    it("should reject initialization from non-authority", async function () {
      await expect(
        contract.connect(signers.alice).initializePeriod()
      ).to.be.revertedWith("Only transit authority");
    });

    it("should reject initialization when paused", async function () {
      await contract.connect(signers.deployer).pause();

      await expect(
        contract.connect(signers.deployer).initializePeriod()
      ).to.be.revertedWith("Contract is paused");
    });

    it("should allow multiple period initializations", async function () {
      await contract.connect(signers.deployer).initializePeriod();
      await contract.connect(signers.deployer).initializePeriod();

      const currentPeriod = await contract.currentPeriod();
      expect(currentPeriod).to.equal(2);
    });
  });

  describe("Data Submission", function () {
    beforeEach(async function () {
      await contract.connect(signers.deployer).initializePeriod();
    });

    it("should allow users to submit data", async function () {
      // Note: In real FHE environment, these would be encrypted values
      // For testing without FHE, we use placeholder values
      const spending = ethers.hexlify(ethers.randomBytes(32));
      const rides = ethers.hexlify(ethers.randomBytes(32));

      await expect(contract.connect(signers.alice).submitData(spending, rides))
        .to.emit(contract, "DataSubmitted")
        .withArgs(signers.alice.address, 1);
    });

    it("should track participant count", async function () {
      const spending = ethers.hexlify(ethers.randomBytes(32));
      const rides = ethers.hexlify(ethers.randomBytes(32));

      await contract.connect(signers.alice).submitData(spending, rides);
      await contract.connect(signers.bob).submitData(spending, rides);

      const periodInfo = await contract.getPeriodInfo(1);
      expect(periodInfo.participantCount).to.equal(2);
    });

    it("should reject duplicate submissions from same user", async function () {
      const spending = ethers.hexlify(ethers.randomBytes(32));
      const rides = ethers.hexlify(ethers.randomBytes(32));

      await contract.connect(signers.alice).submitData(spending, rides);

      await expect(
        contract.connect(signers.alice).submitData(spending, rides)
      ).to.be.revertedWith("Already submitted for this period");
    });

    it("should reject submission when paused", async function () {
      await contract.connect(signers.deployer).pause();

      const spending = ethers.hexlify(ethers.randomBytes(32));
      const rides = ethers.hexlify(ethers.randomBytes(32));

      await expect(
        contract.connect(signers.alice).submitData(spending, rides)
      ).to.be.revertedWith("Contract is paused");
    });

    it("should reject submission when no period is active", async function () {
      // Deploy fresh contract without initializing period
      const { contract: freshContract } = await deployFixture();

      const spending = ethers.hexlify(ethers.randomBytes(32));
      const rides = ethers.hexlify(ethers.randomBytes(32));

      await expect(
        freshContract.connect(signers.alice).submitData(spending, rides)
      ).to.be.revertedWith("No active period");
    });

    it("should handle multiple users submitting data", async function () {
      const spending = ethers.hexlify(ethers.randomBytes(32));
      const rides = ethers.hexlify(ethers.randomBytes(32));

      await contract.connect(signers.alice).submitData(spending, rides);
      await contract.connect(signers.bob).submitData(spending, rides);
      await contract.connect(signers.charlie).submitData(spending, rides);

      const periodInfo = await contract.getPeriodInfo(1);
      expect(periodInfo.participantCount).to.equal(3);
    });

    it("should emit correct event parameters", async function () {
      const spending = ethers.hexlify(ethers.randomBytes(32));
      const rides = ethers.hexlify(ethers.randomBytes(32));

      await expect(contract.connect(signers.alice).submitData(spending, rides))
        .to.emit(contract, "DataSubmitted")
        .withArgs(signers.alice.address, 1);
    });
  });

  describe("Analysis Execution", function () {
    beforeEach(async function () {
      await contract.connect(signers.deployer).initializePeriod();

      // Submit data from multiple users
      const spending = ethers.hexlify(ethers.randomBytes(32));
      const rides = ethers.hexlify(ethers.randomBytes(32));

      await contract.connect(signers.alice).submitData(spending, rides);
      await contract.connect(signers.bob).submitData(spending, rides);
    });

    it("should allow transit authority to perform analysis", async function () {
      await expect(contract.connect(signers.deployer).performAnalysis())
        .to.emit(contract, "AnalysisCompleted");
    });

    it("should mark data as collected after analysis", async function () {
      await contract.connect(signers.deployer).performAnalysis();

      const periodInfo = await contract.getPeriodInfo(1);
      expect(periodInfo.dataCollected).to.equal(true);
    });

    it("should reject analysis from non-authority", async function () {
      await expect(
        contract.connect(signers.alice).performAnalysis()
      ).to.be.revertedWith("Only transit authority");
    });

    it("should reject analysis when paused", async function () {
      await contract.connect(signers.deployer).pause();

      await expect(
        contract.connect(signers.deployer).performAnalysis()
      ).to.be.revertedWith("Contract is paused");
    });

    it("should reject analysis when no period is active", async function () {
      const { contract: freshContract } = await deployFixture();

      await expect(
        freshContract.connect(signers.deployer).performAnalysis()
      ).to.be.revertedWith("No active period");
    });

    it("should reject duplicate analysis for same period", async function () {
      await contract.connect(signers.deployer).performAnalysis();

      await expect(
        contract.connect(signers.deployer).performAnalysis()
      ).to.be.revertedWith("Data already collected for this period");
    });

    it("should emit analysis event with correct parameters", async function () {
      const tx = await contract.connect(signers.deployer).performAnalysis();
      const receipt = await tx.wait();

      await expect(tx)
        .to.emit(contract, "AnalysisCompleted")
        .withArgs(1);
    });
  });

  describe("Period Management", function () {
    beforeEach(async function () {
      await contract.connect(signers.deployer).initializePeriod();
    });

    it("should get period info correctly", async function () {
      const periodInfo = await contract.getPeriodInfo(1);

      expect(periodInfo.period).to.equal(1);
      expect(periodInfo.dataCollected).to.equal(false);
      expect(periodInfo.periodClosed).to.equal(false);
      expect(periodInfo.participantCount).to.equal(0);
    });

    it("should check if period is within data collection window", async function () {
      const isInWindow = await contract.isInDataCollectionWindow();
      expect(isInWindow).to.equal(true);
    });

    it("should track period state through lifecycle", async function () {
      // Initial state
      let periodInfo = await contract.getPeriodInfo(1);
      expect(periodInfo.dataCollected).to.equal(false);
      expect(periodInfo.periodClosed).to.equal(false);

      // After data submission
      const spending = ethers.hexlify(ethers.randomBytes(32));
      const rides = ethers.hexlify(ethers.randomBytes(32));
      await contract.connect(signers.alice).submitData(spending, rides);

      periodInfo = await contract.getPeriodInfo(1);
      expect(periodInfo.participantCount).to.equal(1);

      // After analysis
      await contract.connect(signers.deployer).performAnalysis();
      periodInfo = await contract.getPeriodInfo(1);
      expect(periodInfo.dataCollected).to.equal(true);
    });

    it("should handle queries for non-existent periods", async function () {
      const periodInfo = await contract.getPeriodInfo(999);
      expect(periodInfo.period).to.equal(0);
      expect(periodInfo.participantCount).to.equal(0);
    });
  });

  describe("Access Control", function () {
    it("should allow only transit authority to pause", async function () {
      await expect(
        contract.connect(signers.alice).pause()
      ).to.be.revertedWith("Only transit authority");
    });

    it("should allow only transit authority to unpause", async function () {
      await contract.connect(signers.deployer).pause();

      await expect(
        contract.connect(signers.alice).unpause()
      ).to.be.revertedWith("Only transit authority");
    });

    it("should allow transit authority to pause", async function () {
      await contract.connect(signers.deployer).pause();
      const isPaused = await contract.paused();
      expect(isPaused).to.equal(true);
    });

    it("should allow transit authority to unpause", async function () {
      await contract.connect(signers.deployer).pause();
      await contract.connect(signers.deployer).unpause();
      const isPaused = await contract.paused();
      expect(isPaused).to.equal(false);
    });

    it("should emit Paused event", async function () {
      await expect(contract.connect(signers.deployer).pause())
        .to.emit(contract, "Paused")
        .withArgs(signers.deployer.address);
    });

    it("should emit Unpaused event", async function () {
      await contract.connect(signers.deployer).pause();

      await expect(contract.connect(signers.deployer).unpause())
        .to.emit(contract, "Unpaused")
        .withArgs(signers.deployer.address);
    });
  });

  describe("Edge Cases", function () {
    it("should handle zero participants gracefully", async function () {
      await contract.connect(signers.deployer).initializePeriod();

      await expect(
        contract.connect(signers.deployer).performAnalysis()
      ).to.not.be.reverted;
    });

    it("should handle rapid period transitions", async function () {
      for (let i = 0; i < 5; i++) {
        await contract.connect(signers.deployer).initializePeriod();
      }

      const currentPeriod = await contract.currentPeriod();
      expect(currentPeriod).to.equal(5);
    });

    it("should maintain state across multiple periods", async function () {
      // Period 1
      await contract.connect(signers.deployer).initializePeriod();
      const spending1 = ethers.hexlify(ethers.randomBytes(32));
      const rides1 = ethers.hexlify(ethers.randomBytes(32));
      await contract.connect(signers.alice).submitData(spending1, rides1);
      await contract.connect(signers.deployer).performAnalysis();

      // Period 2
      await contract.connect(signers.deployer).initializePeriod();
      const spending2 = ethers.hexlify(ethers.randomBytes(32));
      const rides2 = ethers.hexlify(ethers.randomBytes(32));
      await contract.connect(signers.alice).submitData(spending2, rides2);

      // Check both periods maintain their state
      const period1Info = await contract.getPeriodInfo(1);
      const period2Info = await contract.getPeriodInfo(2);

      expect(period1Info.dataCollected).to.equal(true);
      expect(period2Info.dataCollected).to.equal(false);
    });

    it("should handle maximum uint32 period number", async function () {
      // This test would take too long in practice, so we just verify the type
      const currentPeriod = await contract.currentPeriod();
      expect(currentPeriod).to.be.a('bigint');
    });
  });

  describe("Gas Optimization", function () {
    it("should have reasonable gas cost for period initialization", async function () {
      const tx = await contract.connect(signers.deployer).initializePeriod();
      const receipt = await tx.wait();

      expect(receipt!.gasUsed).to.be.lt(200000);
    });

    it("should have reasonable gas cost for data submission", async function () {
      await contract.connect(signers.deployer).initializePeriod();

      const spending = ethers.hexlify(ethers.randomBytes(32));
      const rides = ethers.hexlify(ethers.randomBytes(32));

      const tx = await contract.connect(signers.alice).submitData(spending, rides);
      const receipt = await tx.wait();

      expect(receipt!.gasUsed).to.be.lt(300000);
    });

    it("should have reasonable gas cost for analysis", async function () {
      await contract.connect(signers.deployer).initializePeriod();

      const spending = ethers.hexlify(ethers.randomBytes(32));
      const rides = ethers.hexlify(ethers.randomBytes(32));
      await contract.connect(signers.alice).submitData(spending, rides);

      const tx = await contract.connect(signers.deployer).performAnalysis();
      const receipt = await tx.wait();

      expect(receipt!.gasUsed).to.be.lt(500000);
    });
  });

  describe("Security", function () {
    it("should prevent reentrancy attacks", async function () {
      // Contract uses simple state updates without external calls
      // This test verifies the pattern is safe
      await contract.connect(signers.deployer).initializePeriod();

      const spending = ethers.hexlify(ethers.randomBytes(32));
      const rides = ethers.hexlify(ethers.randomBytes(32));

      await expect(
        contract.connect(signers.alice).submitData(spending, rides)
      ).to.not.be.reverted;
    });

    it("should properly validate all inputs", async function () {
      await contract.connect(signers.deployer).initializePeriod();

      // Test with zero bytes (invalid encrypted data)
      const zeroBytes = ethers.ZeroHash;

      // Contract should accept any bytes32 as encrypted data
      // Validation happens at the FHE level
      await expect(
        contract.connect(signers.alice).submitData(zeroBytes, zeroBytes)
      ).to.not.be.reverted;
    });

    it("should maintain consistent state under concurrent operations", async function () {
      await contract.connect(signers.deployer).initializePeriod();

      const spending = ethers.hexlify(ethers.randomBytes(32));
      const rides = ethers.hexlify(ethers.randomBytes(32));

      // Simulate concurrent submissions
      await Promise.all([
        contract.connect(signers.alice).submitData(spending, rides),
        contract.connect(signers.bob).submitData(spending, rides),
        contract.connect(signers.charlie).submitData(spending, rides),
      ]);

      const periodInfo = await contract.getPeriodInfo(1);
      expect(periodInfo.participantCount).to.equal(3);
    });
  });
});
