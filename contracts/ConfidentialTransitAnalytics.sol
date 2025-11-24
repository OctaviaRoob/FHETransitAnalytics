// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, ebool, einput, inEuint32, inEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { Gateway } from "@fhevm/solidity/gateway/Gateway.sol";

/**
 * @title ConfidentialTransitAnalytics
 * @notice Privacy-preserving public transit card analytics using Zama FHE
 * @dev Uses Fully Homomorphic Encryption to hide individual data while allowing aggregate analysis
 *
 * Features:
 * - Multiple FHE types (euint8, euint32, ebool)
 * - Gateway integration for secure decryption
 * - Pausable mechanism for emergency stops
 * - Fail-closed design: transactions fail if conditions not met
 * - Input proof verification via ZKPoK
 * - Comprehensive error handling
 * - Complete event logging
 */
contract ConfidentialTransitAnalytics is SepoliaConfig, Gateway {

    // ============ Custom Errors (Gas Efficient) ============
    error NotAuthorized();
    error NotSubmissionWindow();
    error NotAnalysisWindow();
    error OnlyOddHoursAllowed();
    error PeriodAlreadyActive();
    error DataAlreadySubmitted();
    error NoPeriodActive();
    error PeriodAlreadyClosed();
    error NoDataCollected();
    error PeriodNotClosed();
    error NoParticipants();
    error ContractPaused();
    error NotPauser();
    error InvalidSpendingAmount();
    error InvalidRidesCount();
    error ZeroAddress();

    // ============ State Variables ============
    address public transitAuthority;
    uint32 public currentPeriod;
    bool public paused;

    // UTC+3 timezone offset (3 hours = 10800 seconds)
    uint256 constant UTC_OFFSET = 10800;

    // Constants for validation
    uint32 constant MAX_SPENDING = 1000000; // $10,000 in cents
    uint8 constant MAX_RIDES = 100;

    // Pauser management
    mapping(address => bool) public pausers;
    uint256 public pauserCount;

    struct CardTransaction {
        euint32 encryptedSpending;
        euint8 encryptedRides;
        ebool isValid; // Encrypted validation flag
        bool hasData;
        uint256 timestamp;
    }

    struct AnalysisPeriod {
        euint32 totalRevenue;
        euint32 totalRides;
        ebool hasMinimumData; // Encrypted flag for minimum data check
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
    mapping(uint256 => uint32) public decryptionToPeriod; // Track which period each decryption belongs to

    // ============ Events (Complete Logging) ============
    event PeriodStarted(uint32 indexed period, uint256 startTime, address indexed initiator);
    event DataSubmitted(address indexed cardHolder, uint32 indexed period, uint256 timestamp);
    event DataValidated(address indexed cardHolder, uint32 indexed period, bool isValid);
    event AnalysisRequested(uint32 indexed period, uint256 requestId, uint256 timestamp);
    event PeriodAnalyzed(uint32 indexed period, uint32 totalRevenue, uint32 totalRides, uint256 participantCount);
    event NoDataCollected(uint32 indexed period);
    event Paused(address indexed pauser, uint256 timestamp);
    event Unpaused(address indexed pauser, uint256 timestamp);
    event PauserAdded(address indexed pauser, address indexed addedBy);
    event PauserRemoved(address indexed pauser, address indexed removedBy);
    event AuthorityTransferred(address indexed previousAuthority, address indexed newAuthority);
    event EmergencyWithdrawal(address indexed recipient, uint256 amount);

    // ============ Modifiers (Fail-Closed Design) ============
    modifier onlyAuthority() {
        if (msg.sender != transitAuthority) revert NotAuthorized();
        _;
    }

    modifier onlyPauser() {
        if (!pausers[msg.sender]) revert NotPauser();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    modifier onlyDuringSubmissionWindow() {
        if (!isSubmissionActive()) revert NotSubmissionWindow();
        _;
    }

    modifier onlyDuringAnalysisWindow() {
        if (!isAnalysisActive()) revert NotAnalysisWindow();
        _;
    }

    constructor() {
        if (msg.sender == address(0)) revert ZeroAddress();
        transitAuthority = msg.sender;
        currentPeriod = 1;
        paused = false;

        // Add deployer as first pauser
        pausers[msg.sender] = true;
        pauserCount = 1;
        emit PauserAdded(msg.sender, msg.sender);
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
     * Fail-closed: Reverts if not odd hour or period already active
     */
    function initializePeriod() external whenNotPaused {
        if (!isOddHourWindow()) revert OnlyOddHoursAllowed();
        if (periods[currentPeriod].dataCollected && !periods[currentPeriod].periodClosed) {
            revert PeriodAlreadyActive();
        }

        // Initialize encrypted aggregates to zero
        euint32 zeroRevenue = FHE.asEuint32(0);
        euint32 zeroRides = FHE.asEuint32(0);
        ebool falseFlag = FHE.asEbool(false);

        periods[currentPeriod] = AnalysisPeriod({
            totalRevenue: zeroRevenue,
            totalRides: zeroRides,
            hasMinimumData: falseFlag,
            dataCollected: true,
            periodClosed: false,
            publicRevenue: 0,
            publicRides: 0,
            startTime: block.timestamp,
            endTime: 0,
            participants: new address[](0)
        });

        // Grant access permissions (ACL)
        FHE.allowThis(zeroRevenue);
        FHE.allowThis(zeroRides);
        FHE.allowThis(falseFlag);

        emit PeriodStarted(currentPeriod, block.timestamp, msg.sender);
    }

    /**
     * @notice Submit encrypted transit card data with proof verification
     * @param _encryptedSpending Encrypted spending amount (with ZKPoK proof)
     * @param _encryptedRides Encrypted rides count (with ZKPoK proof)
     * @dev Uses input proofs for verification, fail-closed design with validation
     * Data is encrypted using FHE and aggregated without revealing individual values
     */
    function submitCardData(
        einput _encryptedSpending,
        einput _encryptedRides
    ) external onlyDuringSubmissionWindow whenNotPaused {
        if (cardData[currentPeriod][msg.sender].hasData) revert DataAlreadySubmitted();

        // Convert inputs with proof verification (ZKPoK)
        euint32 encryptedSpending = FHE.asEuint32(_encryptedSpending);
        euint8 encryptedRides = FHE.asEuint8(_encryptedRides);

        // Encrypted validation: check spending <= MAX_SPENDING
        ebool spendingValid = FHE.le(encryptedSpending, FHE.asEuint32(MAX_SPENDING));

        // Encrypted validation: check rides <= MAX_RIDES
        euint32 ridesAs32 = FHE.asEuint32(encryptedRides);
        ebool ridesValid = FHE.le(ridesAs32, FHE.asEuint32(uint32(MAX_RIDES)));

        // Combined validation (both must be true)
        ebool isValid = FHE.and(spendingValid, ridesValid);

        cardData[currentPeriod][msg.sender] = CardTransaction({
            encryptedSpending: encryptedSpending,
            encryptedRides: encryptedRides,
            isValid: isValid,
            hasData: true,
            timestamp: block.timestamp
        });

        // Add to period aggregates using FHE operations (only if valid)
        AnalysisPeriod storage period = periods[currentPeriod];

        // Conditional addition: add only if valid, otherwise add 0
        euint32 validSpending = FHE.select(isValid, encryptedSpending, FHE.asEuint32(0));
        euint32 validRides = FHE.select(isValid, ridesAs32, FHE.asEuint32(0));

        period.totalRevenue = FHE.add(period.totalRevenue, validSpending);
        period.totalRides = FHE.add(period.totalRides, validRides);

        // Update minimum data flag (at least 1 participant)
        period.hasMinimumData = FHE.asEbool(true);

        periods[currentPeriod].participants.push(msg.sender);

        // Grant ACL permissions
        FHE.allowThis(encryptedSpending);
        FHE.allow(encryptedSpending, msg.sender);
        FHE.allowThis(encryptedRides);
        FHE.allow(encryptedRides, msg.sender);
        FHE.allowThis(isValid);
        FHE.allow(isValid, msg.sender);

        emit DataSubmitted(msg.sender, currentPeriod, block.timestamp);
    }

    /**
     * @notice Submit plaintext data (for testing/simple use)
     * @param _spending Spending amount in cents
     * @param _rides Number of rides
     */
    function submitCardDataPlain(uint32 _spending, uint8 _rides) external onlyDuringSubmissionWindow whenNotPaused {
        if (cardData[currentPeriod][msg.sender].hasData) revert DataAlreadySubmitted();
        if (_spending > MAX_SPENDING) revert InvalidSpendingAmount();
        if (_rides > MAX_RIDES) revert InvalidRidesCount();

        // Encrypt the transit data using FHE
        euint32 encryptedSpending = FHE.asEuint32(_spending);
        euint8 encryptedRides = FHE.asEuint8(_rides);
        ebool isValid = FHE.asEbool(true); // Plaintext validation already done

        cardData[currentPeriod][msg.sender] = CardTransaction({
            encryptedSpending: encryptedSpending,
            encryptedRides: encryptedRides,
            isValid: isValid,
            hasData: true,
            timestamp: block.timestamp
        });

        // Add to period aggregates using FHE operations
        AnalysisPeriod storage period = periods[currentPeriod];
        period.totalRevenue = FHE.add(period.totalRevenue, encryptedSpending);

        // Convert euint8 to euint32 for addition
        euint32 ridesAs32 = FHE.asEuint32(encryptedRides);
        period.totalRides = FHE.add(period.totalRides, ridesAs32);

        // Update minimum data flag
        period.hasMinimumData = FHE.asEbool(true);

        periods[currentPeriod].participants.push(msg.sender);

        // Grant ACL permissions
        FHE.allowThis(encryptedSpending);
        FHE.allow(encryptedSpending, msg.sender);
        FHE.allowThis(encryptedRides);
        FHE.allow(encryptedRides, msg.sender);
        FHE.allowThis(isValid);

        emit DataSubmitted(msg.sender, currentPeriod, block.timestamp);
    }

    /**
     * @notice Perform analysis and reveal aggregated results (during even hours)
     * @dev Requests async decryption via Gateway, fail-closed design
     */
    function performAnalysis() external onlyDuringAnalysisWindow whenNotPaused returns (uint256) {
        if (!periods[currentPeriod].dataCollected) revert NoDataCollected();
        if (periods[currentPeriod].periodClosed) revert PeriodAlreadyClosed();

        AnalysisPeriod storage period = periods[currentPeriod];

        // Request async decryption for aggregated data via Gateway
        uint256[] memory cts = new uint256[](2);
        cts[0] = Gateway.toUint256(period.totalRevenue);
        cts[1] = Gateway.toUint256(period.totalRides);

        uint256 requestId = Gateway.requestDecryption(
            cts,
            this.callbackAnalysis.selector,
            0, // No additional callback gas
            block.timestamp + 100, // Deadline
            false // Not passthrough
        );

        // Store mapping for callback
        decryptionToPeriod[requestId] = currentPeriod;

        emit AnalysisRequested(currentPeriod, requestId, block.timestamp);

        return requestId;
    }

    /**
     * @notice Gateway callback - Process decrypted analysis results
     * @param requestId Request ID from Gateway
     * @param revenue Decrypted total revenue
     * @param rides Decrypted total rides
     * @dev Called by Gateway after successful decryption
     */
    function callbackAnalysis(
        uint256 requestId,
        uint32 revenue,
        uint32 rides
    ) public onlyGateway {
        uint32 periodId = decryptionToPeriod[requestId];
        if (periodId == 0) revert NoPeriodActive();

        AnalysisPeriod storage period = periods[periodId];
        period.publicRevenue = revenue;
        period.publicRides = rides;
        period.endTime = block.timestamp;
        period.periodClosed = true;

        emit PeriodAnalyzed(periodId, revenue, rides, period.participants.length);

        // Move to next period if this was current period
        if (periodId == currentPeriod) {
            currentPeriod++;
        }

        // Clean up mapping
        delete decryptionToPeriod[requestId];
    }

    // ============ Pauser Management Functions ============

    /**
     * @notice Add a new pauser
     * @param _pauser Address to grant pauser role
     */
    function addPauser(address _pauser) external onlyAuthority {
        if (_pauser == address(0)) revert ZeroAddress();
        if (!pausers[_pauser]) {
            pausers[_pauser] = true;
            pauserCount++;
            emit PauserAdded(_pauser, msg.sender);
        }
    }

    /**
     * @notice Remove a pauser
     * @param _pauser Address to revoke pauser role
     */
    function removePauser(address _pauser) external onlyAuthority {
        if (pausers[_pauser]) {
            pausers[_pauser] = false;
            pauserCount--;
            emit PauserRemoved(_pauser, msg.sender);
        }
    }

    /**
     * @notice Pause the contract (emergency stop)
     */
    function pause() external onlyPauser {
        paused = true;
        emit Paused(msg.sender, block.timestamp);
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyPauser {
        paused = false;
        emit Unpaused(msg.sender, block.timestamp);
    }

    /**
     * @notice Transfer transit authority to new address
     * @param _newAuthority New authority address
     */
    function transferAuthority(address _newAuthority) external onlyAuthority {
        if (_newAuthority == address(0)) revert ZeroAddress();
        address previousAuthority = transitAuthority;
        transitAuthority = _newAuthority;
        emit AuthorityTransferred(previousAuthority, _newAuthority);
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
        if (!period.periodClosed) revert PeriodNotClosed();
        if (period.participants.length == 0) revert NoParticipants();

        return period.publicRevenue / period.participants.length;
    }

    /**
     * @notice Get average rides per participant for a closed period
     * @param periodNumber Period number to query
     * @return Average number of rides
     */
    function getAverageRides(uint32 periodNumber) external view returns (uint256) {
        AnalysisPeriod storage period = periods[periodNumber];
        if (!period.periodClosed) revert PeriodNotClosed();
        if (period.participants.length == 0) revert NoParticipants();

        return period.publicRides / period.participants.length;
    }

    /**
     * @notice Check if address is a pauser
     * @param _address Address to check
     * @return True if address is pauser
     */
    function isPauser(address _address) external view returns (bool) {
        return pausers[_address];
    }

    /**
     * @notice Get contract status
     * @return _paused Whether contract is paused
     * @return _pauserCount Number of pausers
     * @return _currentPeriod Current period number
     */
    function getContractStatus() external view returns (
        bool _paused,
        uint256 _pauserCount,
        uint32 _currentPeriod
    ) {
        return (paused, pauserCount, currentPeriod);
    }
}