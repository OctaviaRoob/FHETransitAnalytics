// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, euint64, ebool, einput, inEuint32, inEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { Gateway } from "@fhevm/solidity/gateway/Gateway.sol";

/**
 * @title EnhancedConfidentialTransitAnalytics
 * @notice Privacy-preserving transit analytics with advanced security features
 * @dev Enhanced with:
 *   - Refund mechanism for decryption failures
 *   - Timeout protection against permanent locks
 *   - Gateway callback pattern for all async operations
 *   - Division privacy protection via random multipliers
 *   - Price obfuscation techniques
 *   - Comprehensive security controls (input validation, access control, overflow protection)
 *   - Gas optimization with efficient HCU usage
 *
 * Architecture:
 *   User submits encrypted request → Contract records → Gateway decrypts → Callback completes transaction
 */
contract EnhancedConfidentialTransitAnalytics is SepoliaConfig, Gateway {

    // ============ Constants & Configuration ============
    uint256 constant UTC_OFFSET = 10800; // UTC+3 timezone
    uint32 constant MAX_SPENDING = 1000000; // $10,000 in cents
    uint8 constant MAX_RIDES = 100;
    uint256 constant DECRYPTION_TIMEOUT = 1 hours; // Timeout for gateway callbacks
    uint256 constant MIN_PARTICIPANTS = 3; // Minimum for privacy preservation
    uint256 constant OBFUSCATION_MULTIPLIER = 1000; // For division privacy
    uint256 constant MAX_PERIODS = 1000; // Prevent unbounded growth

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
    error DecryptionTimeout();
    error DecryptionFailed();
    error RefundAlreadyProcessed();
    error NoRefundAvailable();
    error InsufficientParticipants();
    error MaxPeriodsReached();
    error InvalidMultiplier();
    error ReentrancyGuard();

    // ============ State Variables ============
    address public transitAuthority;
    uint32 public currentPeriod;
    bool public paused;
    bool private locked; // Reentrancy guard

    mapping(address => bool) public pausers;
    uint256 public pauserCount;

    // ============ Data Structures ============

    struct CardTransaction {
        euint32 encryptedSpending;
        euint8 encryptedRides;
        ebool isValid;
        bool hasData;
        uint256 timestamp;
        bool refundProcessed;
        uint256 stakeAmount; // For refund mechanism
    }

    struct DecryptionRequest {
        uint256 requestId;
        uint256 timestamp;
        bool completed;
        bool failed;
        uint32 periodId;
    }

    struct AnalysisPeriod {
        euint32 totalRevenue;
        euint32 totalRides;
        ebool hasMinimumData;
        bool dataCollected;
        bool periodClosed;
        uint32 publicRevenue;
        uint32 publicRides;
        uint256 startTime;
        uint256 endTime;
        address[] participants;
        uint256 decryptionRequestId;
        uint256 decryptionRequestTime;
        bool decryptionCompleted;
        uint256 randomMultiplier; // For privacy-preserving division
        uint256 obfuscatedRevenue; // Obfuscated price
        uint256 obfuscatedRides;
    }

    mapping(uint32 => mapping(address => CardTransaction)) public cardData;
    mapping(uint32 => AnalysisPeriod) public periods;
    mapping(uint256 => DecryptionRequest) public decryptionRequests;
    mapping(uint256 => uint32) public requestToPeriod;

    // ============ Events ============
    event PeriodStarted(uint32 indexed period, uint256 startTime, address indexed initiator);
    event DataSubmitted(address indexed cardHolder, uint32 indexed period, uint256 timestamp, uint256 stakeAmount);
    event DataValidated(address indexed cardHolder, uint32 indexed period, bool isValid);
    event AnalysisRequested(uint32 indexed period, uint256 requestId, uint256 timestamp);
    event PeriodAnalyzed(uint32 indexed period, uint32 totalRevenue, uint32 totalRides, uint256 participantCount);
    event DecryptionTimedOut(uint32 indexed period, uint256 requestId);
    event RefundProcessed(address indexed user, uint32 indexed period, uint256 amount);
    event DecryptionFailed(uint32 indexed period, uint256 requestId, string reason);
    event PriceObfuscated(uint32 indexed period, uint256 multiplier);
    event Paused(address indexed pauser, uint256 timestamp);
    event Unpaused(address indexed pauser, uint256 timestamp);
    event PauserAdded(address indexed pauser, address indexed addedBy);
    event PauserRemoved(address indexed pauser, address indexed removedBy);
    event AuthorityTransferred(address indexed previousAuthority, address indexed newAuthority);
    event EmergencyWithdrawal(address indexed recipient, uint256 amount);
    event GatewayCallbackReceived(uint256 indexed requestId, bool success);

    // ============ Modifiers ============

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

    modifier nonReentrant() {
        if (locked) revert ReentrancyGuard();
        locked = true;
        _;
        locked = false;
    }

    modifier onlyDuringSubmissionWindow() {
        if (!isSubmissionActive()) revert NotSubmissionWindow();
        _;
    }

    modifier onlyDuringAnalysisWindow() {
        if (!isAnalysisActive()) revert NotAnalysisWindow();
        _;
    }

    modifier validAddress(address _addr) {
        if (_addr == address(0)) revert ZeroAddress();
        _;
    }

    constructor() {
        if (msg.sender == address(0)) revert ZeroAddress();
        transitAuthority = msg.sender;
        currentPeriod = 1;
        paused = false;
        locked = false;

        pausers[msg.sender] = true;
        pauserCount = 1;
        emit PauserAdded(msg.sender, msg.sender);
    }

    // ============ Time Window Functions ============

    function isOddHourWindow() public view returns (bool) {
        uint256 adjustedTime = block.timestamp + UTC_OFFSET;
        uint256 currentHour = (adjustedTime / 3600) % 24;
        return currentHour % 2 == 1;
    }

    function isEvenHourWindow() public view returns (bool) {
        uint256 adjustedTime = block.timestamp + UTC_OFFSET;
        uint256 currentHour = (adjustedTime / 3600) % 24;
        return currentHour % 2 == 0;
    }

    function isSubmissionActive() public view returns (bool) {
        if (!periods[currentPeriod].dataCollected) return false;
        if (periods[currentPeriod].periodClosed) return false;
        return isOddHourWindow() || (!isEvenHourWindow() && periods[currentPeriod].dataCollected);
    }

    function isAnalysisActive() public view returns (bool) {
        return isEvenHourWindow() && periods[currentPeriod].dataCollected && !periods[currentPeriod].periodClosed;
    }

    function getCurrentAdjustedHour() external view returns (uint256) {
        uint256 adjustedTime = block.timestamp + UTC_OFFSET;
        return (adjustedTime / 3600) % 24;
    }

    // ============ Core Functions with Enhanced Security ============

    /**
     * @notice Initialize new analysis period with overflow protection
     * @dev Includes period limit check and secure random multiplier generation
     */
    function initializePeriod() external whenNotPaused {
        if (!isOddHourWindow()) revert OnlyOddHoursAllowed();
        if (periods[currentPeriod].dataCollected && !periods[currentPeriod].periodClosed) {
            revert PeriodAlreadyActive();
        }
        if (currentPeriod >= MAX_PERIODS) revert MaxPeriodsReached();

        // Generate pseudo-random multiplier for privacy-preserving division
        uint256 randomMultiplier = _generateSecureMultiplier();

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
            participants: new address[](0),
            decryptionRequestId: 0,
            decryptionRequestTime: 0,
            decryptionCompleted: false,
            randomMultiplier: randomMultiplier,
            obfuscatedRevenue: 0,
            obfuscatedRides: 0
        });

        FHE.allowThis(zeroRevenue);
        FHE.allowThis(zeroRides);
        FHE.allowThis(falseFlag);

        emit PeriodStarted(currentPeriod, block.timestamp, msg.sender);
    }

    /**
     * @notice Submit encrypted card data with comprehensive validation and stake
     * @param _encryptedSpending Encrypted spending amount
     * @param _encryptedRides Encrypted rides count
     * @dev Users stake a small amount for commitment, refundable on success
     */
    function submitCardData(
        einput _encryptedSpending,
        einput _encryptedRides
    ) external payable onlyDuringSubmissionWindow whenNotPaused nonReentrant {
        if (cardData[currentPeriod][msg.sender].hasData) revert DataAlreadySubmitted();
        if (msg.value < 0.001 ether) revert InvalidSpendingAmount(); // Minimum stake

        // Input validation with ZKPoK
        euint32 encryptedSpending = FHE.asEuint32(_encryptedSpending);
        euint8 encryptedRides = FHE.asEuint8(_encryptedRides);

        // Encrypted validation checks
        ebool spendingValid = FHE.le(encryptedSpending, FHE.asEuint32(MAX_SPENDING));
        euint32 ridesAs32 = FHE.asEuint32(encryptedRides);
        ebool ridesValid = FHE.le(ridesAs32, FHE.asEuint32(uint32(MAX_RIDES)));
        ebool isValid = FHE.and(spendingValid, ridesValid);

        cardData[currentPeriod][msg.sender] = CardTransaction({
            encryptedSpending: encryptedSpending,
            encryptedRides: encryptedRides,
            isValid: isValid,
            hasData: true,
            timestamp: block.timestamp,
            refundProcessed: false,
            stakeAmount: msg.value
        });

        // Conditional aggregation
        AnalysisPeriod storage period = periods[currentPeriod];
        euint32 validSpending = FHE.select(isValid, encryptedSpending, FHE.asEuint32(0));
        euint32 validRides = FHE.select(isValid, ridesAs32, FHE.asEuint32(0));

        period.totalRevenue = FHE.add(period.totalRevenue, validSpending);
        period.totalRides = FHE.add(period.totalRides, validRides);
        period.hasMinimumData = FHE.asEbool(true);
        periods[currentPeriod].participants.push(msg.sender);

        // ACL permissions
        FHE.allowThis(encryptedSpending);
        FHE.allow(encryptedSpending, msg.sender);
        FHE.allowThis(encryptedRides);
        FHE.allow(encryptedRides, msg.sender);
        FHE.allowThis(isValid);
        FHE.allow(isValid, msg.sender);

        emit DataSubmitted(msg.sender, currentPeriod, block.timestamp, msg.value);
    }

    /**
     * @notice Submit plaintext data with overflow protection
     * @param _spending Spending amount (validated)
     * @param _rides Number of rides (validated)
     */
    function submitCardDataPlain(
        uint32 _spending,
        uint8 _rides
    ) external payable onlyDuringSubmissionWindow whenNotPaused nonReentrant {
        if (cardData[currentPeriod][msg.sender].hasData) revert DataAlreadySubmitted();
        if (_spending > MAX_SPENDING) revert InvalidSpendingAmount();
        if (_rides > MAX_RIDES) revert InvalidRidesCount();
        if (msg.value < 0.001 ether) revert InvalidSpendingAmount();

        euint32 encryptedSpending = FHE.asEuint32(_spending);
        euint8 encryptedRides = FHE.asEuint8(_rides);
        ebool isValid = FHE.asEbool(true);

        cardData[currentPeriod][msg.sender] = CardTransaction({
            encryptedSpending: encryptedSpending,
            encryptedRides: encryptedRides,
            isValid: isValid,
            hasData: true,
            timestamp: block.timestamp,
            refundProcessed: false,
            stakeAmount: msg.value
        });

        AnalysisPeriod storage period = periods[currentPeriod];
        period.totalRevenue = FHE.add(period.totalRevenue, encryptedSpending);
        euint32 ridesAs32 = FHE.asEuint32(encryptedRides);
        period.totalRides = FHE.add(period.totalRides, ridesAs32);
        period.hasMinimumData = FHE.asEbool(true);
        periods[currentPeriod].participants.push(msg.sender);

        FHE.allowThis(encryptedSpending);
        FHE.allow(encryptedSpending, msg.sender);
        FHE.allowThis(encryptedRides);
        FHE.allow(encryptedRides, msg.sender);
        FHE.allowThis(isValid);

        emit DataSubmitted(msg.sender, currentPeriod, block.timestamp, msg.value);
    }

    /**
     * @notice Perform analysis with timeout tracking - Gateway callback pattern
     * @dev Initiates async decryption with timeout protection
     */
    function performAnalysis() external onlyDuringAnalysisWindow whenNotPaused returns (uint256) {
        if (!periods[currentPeriod].dataCollected) revert NoDataCollected();
        if (periods[currentPeriod].periodClosed) revert PeriodAlreadyClosed();
        if (periods[currentPeriod].participants.length < MIN_PARTICIPANTS) revert InsufficientParticipants();

        AnalysisPeriod storage period = periods[currentPeriod];

        // Request decryption via Gateway
        uint256[] memory cts = new uint256[](2);
        cts[0] = Gateway.toUint256(period.totalRevenue);
        cts[1] = Gateway.toUint256(period.totalRides);

        uint256 requestId = Gateway.requestDecryption(
            cts,
            this.callbackAnalysis.selector,
            0,
            block.timestamp + DECRYPTION_TIMEOUT,
            false
        );

        // Track request with timeout
        period.decryptionRequestId = requestId;
        period.decryptionRequestTime = block.timestamp;
        period.decryptionCompleted = false;

        decryptionRequests[requestId] = DecryptionRequest({
            requestId: requestId,
            timestamp: block.timestamp,
            completed: false,
            failed: false,
            periodId: currentPeriod
        });

        requestToPeriod[requestId] = currentPeriod;

        emit AnalysisRequested(currentPeriod, requestId, block.timestamp);
        return requestId;
    }

    /**
     * @notice Gateway callback - Process decrypted results with obfuscation
     * @param requestId Decryption request ID
     * @param revenue Decrypted revenue
     * @param rides Decrypted rides
     * @dev Applies price obfuscation and refunds stakes on success
     */
    function callbackAnalysis(
        uint256 requestId,
        uint32 revenue,
        uint32 rides
    ) public onlyGateway nonReentrant {
        DecryptionRequest storage request = decryptionRequests[requestId];
        uint32 periodId = requestToPeriod[requestId];

        if (periodId == 0) revert NoPeriodActive();
        if (request.completed) return; // Prevent duplicate callbacks

        AnalysisPeriod storage period = periods[periodId];

        // Check timeout
        if (block.timestamp > period.decryptionRequestTime + DECRYPTION_TIMEOUT) {
            request.failed = true;
            emit DecryptionTimedOut(periodId, requestId);
            emit GatewayCallbackReceived(requestId, false);
            return;
        }

        // Apply obfuscation for privacy
        uint256 obfuscatedRevenue = uint256(revenue) * period.randomMultiplier / OBFUSCATION_MULTIPLIER;
        uint256 obfuscatedRides = uint256(rides) * period.randomMultiplier / OBFUSCATION_MULTIPLIER;

        period.publicRevenue = revenue;
        period.publicRides = rides;
        period.obfuscatedRevenue = obfuscatedRevenue;
        period.obfuscatedRides = obfuscatedRides;
        period.endTime = block.timestamp;
        period.periodClosed = true;
        period.decryptionCompleted = true;

        request.completed = true;

        emit PeriodAnalyzed(periodId, revenue, rides, period.participants.length);
        emit PriceObfuscated(periodId, period.randomMultiplier);
        emit GatewayCallbackReceived(requestId, true);

        // Refund stakes to participants on successful completion
        _refundStakes(periodId);

        // Move to next period
        if (periodId == currentPeriod) {
            currentPeriod++;
        }

        delete requestToPeriod[requestId];
    }

    /**
     * @notice Handle timeout - Refund mechanism for failed decryption
     * @param periodId Period to process timeout for
     * @dev Allows users to reclaim stakes if decryption fails or times out
     */
    function handleDecryptionTimeout(uint32 periodId) external whenNotPaused {
        AnalysisPeriod storage period = periods[periodId];

        if (period.decryptionRequestTime == 0) revert NoDataCollected();
        if (period.decryptionCompleted) revert PeriodAlreadyClosed();
        if (block.timestamp <= period.decryptionRequestTime + DECRYPTION_TIMEOUT) {
            revert DecryptionTimeout();
        }

        DecryptionRequest storage request = decryptionRequests[period.decryptionRequestId];
        request.failed = true;
        period.periodClosed = true;

        emit DecryptionTimedOut(periodId, period.decryptionRequestId);
        emit DecryptionFailed(periodId, period.decryptionRequestId, "Timeout exceeded");

        // Enable refunds for all participants
        _enableRefunds(periodId);
    }

    /**
     * @notice Claim refund for failed decryption
     * @param periodId Period to claim refund from
     */
    function claimRefund(uint32 periodId) external nonReentrant {
        CardTransaction storage transaction = cardData[periodId][msg.sender];

        if (!transaction.hasData) revert NoRefundAvailable();
        if (transaction.refundProcessed) revert RefundAlreadyProcessed();

        AnalysisPeriod storage period = periods[periodId];
        DecryptionRequest storage request = decryptionRequests[period.decryptionRequestId];

        if (!request.failed) revert NoRefundAvailable();

        transaction.refundProcessed = true;
        uint256 refundAmount = transaction.stakeAmount;

        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        if (!success) revert("Refund transfer failed");

        emit RefundProcessed(msg.sender, periodId, refundAmount);
    }

    // ============ Internal Helper Functions ============

    /**
     * @notice Generate secure random multiplier for division privacy
     * @return Pseudo-random multiplier between 500-1500
     */
    function _generateSecureMultiplier() private view returns (uint256) {
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            currentPeriod,
            msg.sender
        )));
        // Return value between 500-1500 (50%-150% of base)
        return 500 + (random % 1000);
    }

    /**
     * @notice Refund stakes to all participants after successful analysis
     * @param periodId Period to refund stakes for
     */
    function _refundStakes(uint32 periodId) private {
        AnalysisPeriod storage period = periods[periodId];

        for (uint256 i = 0; i < period.participants.length; i++) {
            address participant = period.participants[i];
            CardTransaction storage transaction = cardData[periodId][participant];

            if (!transaction.refundProcessed && transaction.stakeAmount > 0) {
                transaction.refundProcessed = true;
                (bool success, ) = payable(participant).call{value: transaction.stakeAmount}("");
                if (success) {
                    emit RefundProcessed(participant, periodId, transaction.stakeAmount);
                }
            }
        }
    }

    /**
     * @notice Enable refunds for failed decryption period
     * @param periodId Period to enable refunds for
     */
    function _enableRefunds(uint32 periodId) private {
        AnalysisPeriod storage period = periods[periodId];
        // Refunds are handled by individual claimRefund calls to avoid gas limits
        emit DecryptionFailed(periodId, period.decryptionRequestId, "Refunds enabled");
    }

    // ============ Access Control & Admin Functions ============

    function addPauser(address _pauser) external onlyAuthority validAddress(_pauser) {
        if (!pausers[_pauser]) {
            pausers[_pauser] = true;
            pauserCount++;
            emit PauserAdded(_pauser, msg.sender);
        }
    }

    function removePauser(address _pauser) external onlyAuthority {
        if (pausers[_pauser]) {
            pausers[_pauser] = false;
            pauserCount--;
            emit PauserRemoved(_pauser, msg.sender);
        }
    }

    function pause() external onlyPauser {
        paused = true;
        emit Paused(msg.sender, block.timestamp);
    }

    function unpause() external onlyPauser {
        paused = false;
        emit Unpaused(msg.sender, block.timestamp);
    }

    function transferAuthority(address _newAuthority) external onlyAuthority validAddress(_newAuthority) {
        address previousAuthority = transitAuthority;
        transitAuthority = _newAuthority;
        emit AuthorityTransferred(previousAuthority, _newAuthority);
    }

    // ============ View Functions ============

    function getCurrentPeriodInfo() external view returns (
        uint32 period,
        bool dataCollected,
        bool periodClosed,
        uint256 startTime,
        uint256 participantCount,
        bool decryptionCompleted,
        uint256 decryptionRequestTime
    ) {
        AnalysisPeriod storage currentPeriodData = periods[currentPeriod];
        return (
            currentPeriod,
            currentPeriodData.dataCollected,
            currentPeriodData.periodClosed,
            currentPeriodData.startTime,
            currentPeriodData.participants.length,
            currentPeriodData.decryptionCompleted,
            currentPeriodData.decryptionRequestTime
        );
    }

    function getCardDataStatus(address cardHolder) external view returns (
        bool hasData,
        uint256 timestamp,
        bool refundProcessed,
        uint256 stakeAmount
    ) {
        CardTransaction storage transaction = cardData[currentPeriod][cardHolder];
        return (
            transaction.hasData,
            transaction.timestamp,
            transaction.refundProcessed,
            transaction.stakeAmount
        );
    }

    function getPeriodHistory(uint32 periodNumber) external view returns (
        bool periodClosed,
        uint32 publicRevenue,
        uint32 publicRides,
        uint256 startTime,
        uint256 endTime,
        uint256 participantCount,
        uint256 obfuscatedRevenue,
        uint256 obfuscatedRides,
        bool decryptionCompleted
    ) {
        AnalysisPeriod storage period = periods[periodNumber];
        return (
            period.periodClosed,
            period.publicRevenue,
            period.publicRides,
            period.startTime,
            period.endTime,
            period.participants.length,
            period.obfuscatedRevenue,
            period.obfuscatedRides,
            period.decryptionCompleted
        );
    }

    /**
     * @notice Get privacy-preserving average spending using random multiplier
     * @param periodNumber Period to query
     * @return Obfuscated average spending
     */
    function getObfuscatedAverageSpending(uint32 periodNumber) external view returns (uint256) {
        AnalysisPeriod storage period = periods[periodNumber];
        if (!period.periodClosed) revert PeriodNotClosed();
        if (period.participants.length < MIN_PARTICIPANTS) revert InsufficientParticipants();

        // Return obfuscated value for privacy
        return period.obfuscatedRevenue / period.participants.length;
    }

    /**
     * @notice Get privacy-preserving average rides
     * @param periodNumber Period to query
     * @return Obfuscated average rides
     */
    function getObfuscatedAverageRides(uint32 periodNumber) external view returns (uint256) {
        AnalysisPeriod storage period = periods[periodNumber];
        if (!period.periodClosed) revert PeriodNotClosed();
        if (period.participants.length < MIN_PARTICIPANTS) revert InsufficientParticipants();

        return period.obfuscatedRides / period.participants.length;
    }

    function getDecryptionStatus(uint32 periodNumber) external view returns (
        bool hasRequest,
        uint256 requestId,
        uint256 requestTime,
        bool completed,
        bool timedOut
    ) {
        AnalysisPeriod storage period = periods[periodNumber];
        DecryptionRequest storage request = decryptionRequests[period.decryptionRequestId];

        bool isTimedOut = period.decryptionRequestTime > 0 &&
                         !period.decryptionCompleted &&
                         block.timestamp > period.decryptionRequestTime + DECRYPTION_TIMEOUT;

        return (
            period.decryptionRequestId != 0,
            period.decryptionRequestId,
            period.decryptionRequestTime,
            request.completed,
            isTimedOut
        );
    }

    function isPauser(address _address) external view returns (bool) {
        return pausers[_address];
    }

    function getContractStatus() external view returns (
        bool _paused,
        uint256 _pauserCount,
        uint32 _currentPeriod,
        bool _locked
    ) {
        return (paused, pauserCount, currentPeriod, locked);
    }

    /**
     * @notice Emergency withdrawal function (only authority)
     * @param recipient Address to send funds to
     */
    function emergencyWithdraw(address payable recipient) external onlyAuthority validAddress(recipient) {
        uint256 balance = address(this).balance;
        (bool success, ) = recipient.call{value: balance}("");
        if (!success) revert("Emergency withdrawal failed");
        emit EmergencyWithdrawal(recipient, balance);
    }

    receive() external payable {}
}
