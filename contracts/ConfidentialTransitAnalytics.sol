// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title ConfidentialTransitAnalytics
 * @notice Privacy-preserving public transit card analytics using Zama FHE
 * @dev Uses Fully Homomorphic Encryption to hide individual data while allowing aggregate analysis
 */
contract ConfidentialTransitAnalytics is SepoliaConfig {

    address public transitAuthority;
    uint32 public currentPeriod;

    // UTC+3 timezone offset (3 hours = 10800 seconds)
    uint256 constant UTC_OFFSET = 10800;

    struct CardTransaction {
        euint32 encryptedSpending;
        euint8 encryptedRides;
        bool hasData;
        uint256 timestamp;
    }

    struct AnalysisPeriod {
        euint32 totalRevenue;
        euint32 totalRides;
        bool dataCollected;
        bool periodClosed;
        uint32 publicRevenue;
        uint32 publicRides;
        uint256 startTime;
        uint256 endTime;
        address[] participants;
    }

    mapping(uint32 => mapping(address => CardTransaction)) public cardData;
    mapping(uint32 => AnalysisPeriod) public periods;

    event PeriodStarted(uint32 indexed period, uint256 startTime);
    event DataSubmitted(address indexed cardHolder, uint32 indexed period);
    event PeriodAnalyzed(uint32 indexed period, uint32 totalRevenue, uint32 totalRides);
    event NoDataCollected(uint32 indexed period);

    modifier onlyAuthority() {
        require(msg.sender == transitAuthority, "Not authorized");
        _;
    }

    modifier onlyDuringSubmissionWindow() {
        require(isSubmissionActive(), "Not submission window");
        _;
    }

    modifier onlyDuringAnalysisWindow() {
        require(isAnalysisActive(), "Not analysis window");
        _;
    }

    constructor() {
        transitAuthority = msg.sender;
        currentPeriod = 1;
    }

    // ============ Time Window Functions ============

    // Check if current time is in odd hour window (UTC+3: 13:00, 15:00, 17:00...)
    function isOddHourWindow() public view returns (bool) {
        uint256 adjustedTime = block.timestamp + UTC_OFFSET;
        uint256 currentHour = (adjustedTime / 3600) % 24;
        return currentHour % 2 == 1;
    }

    // Check if current time is in even hour window (UTC+3: 14:00, 16:00, 18:00...)
    function isEvenHourWindow() public view returns (bool) {
        uint256 adjustedTime = block.timestamp + UTC_OFFSET;
        uint256 currentHour = (adjustedTime / 3600) % 24;
        return currentHour % 2 == 0;
    }

    // Check if data submission is currently active
    function isSubmissionActive() public view returns (bool) {
        if (!periods[currentPeriod].dataCollected) return false;
        if (periods[currentPeriod].periodClosed) return false;
        return isOddHourWindow() || (!isEvenHourWindow() && periods[currentPeriod].dataCollected);
    }

    // Check if analysis window is currently active
    function isAnalysisActive() public view returns (bool) {
        return isEvenHourWindow() && periods[currentPeriod].dataCollected && !periods[currentPeriod].periodClosed;
    }

    // Get current hour in UTC+3
    function getCurrentAdjustedHour() external view returns (uint256) {
        uint256 adjustedTime = block.timestamp + UTC_OFFSET;
        return (adjustedTime / 3600) % 24;
    }

    // ============ Core Functions ============

    /**
     * @notice Initialize new analysis period (during odd hours)
     * @dev Initializes encrypted aggregates to zero
     */
    function initializePeriod() external {
        require(isOddHourWindow(), "Can only initialize during odd hours");
        require(!periods[currentPeriod].dataCollected || periods[currentPeriod].periodClosed, "Period already active");

        // Initialize encrypted aggregates to zero
        euint32 zeroRevenue = FHE.asEuint32(0);
        euint32 zeroRides = FHE.asEuint32(0);

        periods[currentPeriod] = AnalysisPeriod({
            totalRevenue: zeroRevenue,
            totalRides: zeroRides,
            dataCollected: true,
            periodClosed: false,
            publicRevenue: 0,
            publicRides: 0,
            startTime: block.timestamp,
            endTime: 0,
            participants: new address[](0)
        });

        // Grant access permissions
        FHE.allowThis(zeroRevenue);
        FHE.allowThis(zeroRides);

        emit PeriodStarted(currentPeriod, block.timestamp);
    }

    /**
     * @notice Submit encrypted transit card data (during submission window)
     * @param _spending Spending amount in cents
     * @param _rides Number of rides taken
     * @dev Data is encrypted using FHE and aggregated without revealing individual values
     */
    function submitCardData(uint32 _spending, uint8 _rides) external onlyDuringSubmissionWindow {
        require(!cardData[currentPeriod][msg.sender].hasData, "Data already submitted this period");

        // Encrypt the transit data using FHE
        euint32 encryptedSpending = FHE.asEuint32(_spending);
        euint8 encryptedRides = FHE.asEuint8(_rides);

        cardData[currentPeriod][msg.sender] = CardTransaction({
            encryptedSpending: encryptedSpending,
            encryptedRides: encryptedRides,
            hasData: true,
            timestamp: block.timestamp
        });

        // Add to period aggregates using FHE operations
        AnalysisPeriod storage period = periods[currentPeriod];
        period.totalRevenue = FHE.add(period.totalRevenue, encryptedSpending);

        // Convert euint8 to euint32 for addition
        euint32 ridesAs32 = FHE.asEuint32(encryptedRides);
        period.totalRides = FHE.add(period.totalRides, ridesAs32);

        periods[currentPeriod].participants.push(msg.sender);

        // Grant ACL permissions
        FHE.allowThis(encryptedSpending);
        FHE.allow(encryptedSpending, msg.sender);
        FHE.allowThis(encryptedRides);
        FHE.allow(encryptedRides, msg.sender);

        emit DataSubmitted(msg.sender, currentPeriod);
    }

    /**
     * @notice Perform analysis and reveal aggregated results (during even hours)
     * @dev Requests async decryption of aggregated data
     */
    function performAnalysis() external onlyDuringAnalysisWindow {
        require(periods[currentPeriod].dataCollected, "No data collected");
        require(!periods[currentPeriod].periodClosed, "Period already closed");

        AnalysisPeriod storage period = periods[currentPeriod];

        // Request async decryption for aggregated data
        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(period.totalRevenue);
        cts[1] = FHE.toBytes32(period.totalRides);
        FHE.requestDecryption(cts, this.processAnalysis.selector);
    }

    /**
     * @notice Decryption callback - Process analysis results
     * @param requestId Request ID from decryption service
     * @param revenue Decrypted total revenue
     * @param rides Decrypted total rides
     * @param signatures Cryptographic signatures for verification
     * @dev This function is called by the decryption service
     */
    function processAnalysis(
        uint256 requestId,
        uint32 revenue,
        uint32 rides,
        bytes[] memory signatures
    ) external {
        // Validate signatures
        FHE.checkSignatures(requestId, signatures);

        AnalysisPeriod storage period = periods[currentPeriod];
        period.publicRevenue = revenue;
        period.publicRides = rides;
        period.endTime = block.timestamp;
        period.periodClosed = true;

        emit PeriodAnalyzed(currentPeriod, revenue, rides);

        // Move to next period
        currentPeriod++;
    }

    // ============ View Functions ============

    /**
     * @notice Get current period information
     * @return period Current period number
     * @return dataCollected Whether data collection is active
     * @return periodClosed Whether period is closed
     * @return startTime Period start timestamp
     * @return participantCount Number of participants
     */
    function getCurrentPeriodInfo() external view returns (
        uint32 period,
        bool dataCollected,
        bool periodClosed,
        uint256 startTime,
        uint256 participantCount
    ) {
        AnalysisPeriod storage currentPeriodData = periods[currentPeriod];
        return (
            currentPeriod,
            currentPeriodData.dataCollected,
            currentPeriodData.periodClosed,
            currentPeriodData.startTime,
            currentPeriodData.participants.length
        );
    }

    /**
     * @notice Check if card holder has submitted data for current period
     * @param cardHolder Address to check
     * @return hasData Whether data has been submitted
     * @return timestamp Submission timestamp
     */
    function getCardDataStatus(address cardHolder) external view returns (
        bool hasData,
        uint256 timestamp
    ) {
        CardTransaction storage transaction = cardData[currentPeriod][cardHolder];
        return (transaction.hasData, transaction.timestamp);
    }

    /**
     * @notice Get historical period data (after analysis)
     * @param periodNumber Period number to query
     * @return periodClosed Whether period is closed
     * @return publicRevenue Decrypted total revenue
     * @return publicRides Decrypted total rides
     * @return startTime Period start time
     * @return endTime Period end time
     * @return participantCount Number of participants
     */
    function getPeriodHistory(uint32 periodNumber) external view returns (
        bool periodClosed,
        uint32 publicRevenue,
        uint32 publicRides,
        uint256 startTime,
        uint256 endTime,
        uint256 participantCount
    ) {
        AnalysisPeriod storage period = periods[periodNumber];
        return (
            period.periodClosed,
            period.publicRevenue,
            period.publicRides,
            period.startTime,
            period.endTime,
            period.participants.length
        );
    }

    /**
     * @notice Get average spending per participant for a closed period
     * @param periodNumber Period number to query
     * @return Average spending in cents
     */
    function getAverageSpending(uint32 periodNumber) external view returns (uint256) {
        AnalysisPeriod storage period = periods[periodNumber];
        require(period.periodClosed, "Period not closed yet");
        require(period.participants.length > 0, "No participants");

        return period.publicRevenue / period.participants.length;
    }

    /**
     * @notice Get average rides per participant for a closed period
     * @param periodNumber Period number to query
     * @return Average number of rides
     */
    function getAverageRides(uint32 periodNumber) external view returns (uint256) {
        AnalysisPeriod storage period = periods[periodNumber];
        require(period.periodClosed, "Period not closed yet");
        require(period.participants.length > 0, "No participants");

        return period.publicRides / period.participants.length;
    }
}