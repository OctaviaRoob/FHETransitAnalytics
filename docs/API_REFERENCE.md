# API Reference - Enhanced Confidential Transit Analytics

## Table of Contents
- [Core Functions](#core-functions)
- [Admin Functions](#admin-functions)
- [View Functions](#view-functions)
- [Events](#events)
- [Error Codes](#error-codes)
- [Data Structures](#data-structures)

---

## Core Functions

### initializePeriod()

Initialize a new analysis period with secure random multiplier generation.

```solidity
function initializePeriod() external whenNotPaused
```

**Access**: Public (any address)

**Requirements**:
- Must be called during odd hour window (UTC+3: 13:00, 15:00, 17:00, etc.)
- Previous period must be closed
- Current period must not exceed MAX_PERIODS (1000)
- Contract must not be paused

**Effects**:
- Creates new `AnalysisPeriod` with zero-initialized encrypted aggregates
- Generates random multiplier (500-1500 range) for privacy protection
- Increments period tracking
- Grants ACL permissions for FHE operations

**Events**:
- `PeriodStarted(uint32 period, uint256 startTime, address initiator)`

**Errors**:
- `OnlyOddHoursAllowed()` - Called outside odd hour window
- `PeriodAlreadyActive()` - Current period still active
- `MaxPeriodsReached()` - Period limit exceeded
- `ContractPaused()` - Contract is paused

**Gas Cost**: ~200,000 - 250,000 gas

**Example**:
```javascript
// Wait for odd hour (13:00, 15:00, 17:00, etc. UTC+3)
const currentHour = await contract.getCurrentAdjustedHour();
if (currentHour % 2 === 1) {
    await contract.initializePeriod();
}
```

---

### submitCardData()

Submit encrypted transit card data with proof verification and stake.

```solidity
function submitCardData(
    einput _encryptedSpending,
    einput _encryptedRides
) external payable onlyDuringSubmissionWindow whenNotPaused nonReentrant
```

**Access**: Public (any address)

**Parameters**:
- `_encryptedSpending` (einput): Encrypted spending amount with ZKPoK proof
- `_encryptedRides` (einput): Encrypted ride count with ZKPoK proof

**Payment Required**: Minimum 0.001 ETH stake (refundable)

**Requirements**:
- Called during submission window (odd hours)
- User has not already submitted for current period
- Valid ZKPoK proofs provided
- Minimum stake sent with transaction
- Contract not paused

**Effects**:
- Stores encrypted data in `cardData` mapping
- Performs encrypted validation checks (spending ≤ MAX_SPENDING, rides ≤ MAX_RIDES)
- Conditionally aggregates valid data to period totals
- Records stake amount for refund mechanism
- Grants ACL permissions for user and contract

**Events**:
- `DataSubmitted(address cardHolder, uint32 period, uint256 timestamp, uint256 stakeAmount)`

**Errors**:
- `NotSubmissionWindow()` - Called outside submission window
- `DataAlreadySubmitted()` - User already submitted this period
- `InvalidSpendingAmount()` - Stake too low
- `ContractPaused()` - Contract paused
- `ReentrancyGuard()` - Reentrancy attempt

**Gas Cost**: ~400,000 - 600,000 gas (includes FHE operations)

**Example**:
```javascript
const fheInstance = await createFhevmInstance();
const encryptedSpending = fheInstance.encrypt32(5000); // $50.00
const encryptedRides = fheInstance.encrypt8(12);

await contract.submitCardData(
    encryptedSpending,
    encryptedRides,
    { value: ethers.parseEther("0.001") }
);
```

---

### submitCardDataPlain()

Submit plaintext transit card data (for testing or transparent submissions).

```solidity
function submitCardDataPlain(
    uint32 _spending,
    uint8 _rides
) external payable onlyDuringSubmissionWindow whenNotPaused nonReentrant
```

**Access**: Public (any address)

**Parameters**:
- `_spending` (uint32): Spending amount in cents (0 - 1,000,000)
- `_rides` (uint8): Number of rides (0 - 100)

**Payment Required**: Minimum 0.001 ETH stake (refundable)

**Requirements**:
- Called during submission window
- User has not already submitted
- Spending ≤ MAX_SPENDING (1,000,000 cents = $10,000)
- Rides ≤ MAX_RIDES (100)
- Minimum stake provided

**Effects**:
- Converts plaintext to encrypted values internally
- Aggregates to period totals
- Records stake for refund

**Events**:
- `DataSubmitted(address cardHolder, uint32 period, uint256 timestamp, uint256 stakeAmount)`

**Errors**:
- `NotSubmissionWindow()`
- `DataAlreadySubmitted()`
- `InvalidSpendingAmount()` - Spending exceeds limit or stake too low
- `InvalidRidesCount()` - Rides exceed limit

**Gas Cost**: ~350,000 - 500,000 gas

**Example**:
```javascript
await contract.submitCardDataPlain(
    5000,  // $50.00 in cents
    12,    // 12 rides
    { value: ethers.parseEther("0.001") }
);
```

---

### performAnalysis()

Trigger period analysis via Gateway decryption callback.

```solidity
function performAnalysis()
    external
    onlyDuringAnalysisWindow
    whenNotPaused
    returns (uint256)
```

**Access**: Public (any address)

**Returns**:
- `uint256` - Decryption request ID

**Requirements**:
- Called during analysis window (even hours)
- Current period has collected data
- Period not already closed
- Minimum participants met (≥3)

**Effects**:
- Requests decryption of aggregated revenue and rides via Gateway
- Records request ID and timestamp for timeout tracking
- Initiates async callback flow

**Events**:
- `AnalysisRequested(uint32 period, uint256 requestId, uint256 timestamp)`

**Errors**:
- `NotAnalysisWindow()` - Called outside even hour window
- `NoDataCollected()` - No data submitted for period
- `PeriodAlreadyClosed()` - Period already analyzed
- `InsufficientParticipants()` - Less than 3 participants

**Gas Cost**: ~250,000 - 350,000 gas (Gateway request)

**Callback**: Triggers `callbackAnalysis()` when Gateway completes decryption (within 1 hour)

**Example**:
```javascript
const currentHour = await contract.getCurrentAdjustedHour();
if (currentHour % 2 === 0) {  // Even hour
    const requestId = await contract.performAnalysis();
    console.log(`Decryption requested: ${requestId}`);
}
```

---

### callbackAnalysis()

Gateway callback function - processes decrypted analysis results.

```solidity
function callbackAnalysis(
    uint256 requestId,
    uint32 revenue,
    uint32 rides
) public onlyGateway nonReentrant
```

**Access**: Gateway only (internal callback)

**Parameters**:
- `requestId` (uint256): Decryption request identifier
- `revenue` (uint32): Decrypted total revenue
- `rides` (uint32): Decrypted total rides

**Effects**:
- Verifies timeout not exceeded
- Applies price obfuscation using random multiplier
- Stores public and obfuscated results
- Marks period as closed
- Refunds stakes to all participants
- Increments to next period

**Events**:
- `PeriodAnalyzed(uint32 period, uint32 totalRevenue, uint32 totalRides, uint256 participantCount)`
- `PriceObfuscated(uint32 period, uint256 multiplier)`
- `GatewayCallbackReceived(uint256 requestId, bool success)`
- `RefundProcessed(address user, uint32 period, uint256 amount)` (for each participant)

**Errors**:
- `NoPeriodActive()` - Invalid request ID
- `DecryptionTimedOut()` - Callback received after timeout

**Notes**:
- This function is called automatically by the Gateway
- Users do not call this directly
- Timeout protection ensures callback within 1 hour

---

### handleDecryptionTimeout()

Handle timed-out decryption requests and enable refunds.

```solidity
function handleDecryptionTimeout(uint32 periodId) external whenNotPaused
```

**Access**: Public (any address)

**Parameters**:
- `periodId` (uint32): Period to handle timeout for

**Requirements**:
- Period has pending decryption request
- Decryption not yet completed
- Timeout period exceeded (>1 hour since request)

**Effects**:
- Marks decryption request as failed
- Closes period without results
- Enables manual refund claims

**Events**:
- `DecryptionTimedOut(uint32 period, uint256 requestId)`
- `DecryptionFailed(uint32 period, uint256 requestId, string reason)`

**Errors**:
- `NoDataCollected()` - No decryption request exists
- `PeriodAlreadyClosed()` - Decryption already completed
- `DecryptionTimeout()` - Timeout not yet exceeded

**Gas Cost**: ~50,000 - 80,000 gas

**Example**:
```javascript
// After waiting >1 hour from analysis request
const status = await contract.getDecryptionStatus(periodId);
if (status.timedOut && !status.completed) {
    await contract.handleDecryptionTimeout(periodId);
}
```

---

### claimRefund()

Claim refund for failed/timed-out decryption period.

```solidity
function claimRefund(uint32 periodId) external nonReentrant
```

**Access**: Public (participants only)

**Parameters**:
- `periodId` (uint32): Period to claim refund from

**Requirements**:
- User submitted data for specified period
- Refund not already processed
- Decryption request failed or timed out

**Effects**:
- Marks refund as processed
- Transfers stake back to user

**Events**:
- `RefundProcessed(address user, uint32 period, uint256 amount)`

**Errors**:
- `NoRefundAvailable()` - User didn't participate or decryption succeeded
- `RefundAlreadyProcessed()` - User already claimed refund

**Gas Cost**: ~40,000 - 60,000 gas

**Example**:
```javascript
try {
    await contract.claimRefund(periodId);
    console.log("Refund claimed successfully");
} catch (error) {
    console.log("No refund available or already claimed");
}
```

---

## Admin Functions

### addPauser()

Grant pauser role to address.

```solidity
function addPauser(address _pauser) external onlyAuthority validAddress(_pauser)
```

**Access**: Transit Authority only

**Parameters**:
- `_pauser` (address): Address to grant pauser role

**Effects**:
- Adds address to pauser mapping
- Increments pauser count

**Events**:
- `PauserAdded(address pauser, address addedBy)`

**Errors**:
- `NotAuthorized()` - Caller not authority
- `ZeroAddress()` - Invalid address

---

### removePauser()

Revoke pauser role from address.

```solidity
function removePauser(address _pauser) external onlyAuthority
```

**Access**: Transit Authority only

**Events**:
- `PauserRemoved(address pauser, address removedBy)`

---

### pause()

Emergency pause contract operations.

```solidity
function pause() external onlyPauser
```

**Access**: Pausers only

**Effects**:
- Sets `paused` flag to true
- Blocks all state-changing functions except admin operations

**Events**:
- `Paused(address pauser, uint256 timestamp)`

**Use Cases**:
- Critical vulnerability discovered
- Suspicious activity detected
- Maintenance operations

---

### unpause()

Resume contract operations.

```solidity
function unpause() external onlyPauser
```

**Access**: Pausers only

**Events**:
- `Unpaused(address pauser, uint256 timestamp)`

---

### transferAuthority()

Transfer transit authority role to new address.

```solidity
function transferAuthority(address _newAuthority)
    external
    onlyAuthority
    validAddress(_newAuthority)
```

**Access**: Current authority only

**Parameters**:
- `_newAuthority` (address): New authority address

**Events**:
- `AuthorityTransferred(address previousAuthority, address newAuthority)`

**Security Note**: Use multi-sig for authority address

---

### emergencyWithdraw()

Emergency withdrawal of contract balance.

```solidity
function emergencyWithdraw(address payable recipient)
    external
    onlyAuthority
    validAddress(recipient)
```

**Access**: Transit Authority only

**Parameters**:
- `recipient` (address): Address to receive funds

**Events**:
- `EmergencyWithdrawal(address recipient, uint256 amount)`

**Warning**: Only use in extreme circumstances after ensuring all legitimate refunds processed

---

## View Functions

### getCurrentPeriodInfo()

Get comprehensive current period status.

```solidity
function getCurrentPeriodInfo() external view returns (
    uint32 period,
    bool dataCollected,
    bool periodClosed,
    uint256 startTime,
    uint256 participantCount,
    bool decryptionCompleted,
    uint256 decryptionRequestTime
)
```

**Returns**:
- `period`: Current period number
- `dataCollected`: Whether period initialized
- `periodClosed`: Whether analysis completed
- `startTime`: Period initialization timestamp
- `participantCount`: Number of data submissions
- `decryptionCompleted`: Whether Gateway callback received
- `decryptionRequestTime`: When analysis requested

**Example**:
```javascript
const info = await contract.getCurrentPeriodInfo();
console.log(`Period ${info.period}: ${info.participantCount} participants`);
```

---

### getCardDataStatus()

Check user's submission status for current period.

```solidity
function getCardDataStatus(address cardHolder) external view returns (
    bool hasData,
    uint256 timestamp,
    bool refundProcessed,
    uint256 stakeAmount
)
```

**Parameters**:
- `cardHolder` (address): User address to check

**Returns**:
- `hasData`: Whether user submitted data
- `timestamp`: Submission timestamp
- `refundProcessed`: Whether refund claimed/received
- `stakeAmount`: Original stake amount

---

### getPeriodHistory()

Get historical period results and metadata.

```solidity
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
)
```

**Parameters**:
- `periodNumber` (uint32): Period to query (1-based)

**Returns**:
- `periodClosed`: Whether period completed
- `publicRevenue`: True total revenue (cents)
- `publicRides`: True total rides
- `startTime`: Period start
- `endTime`: Period close time
- `participantCount`: Number of participants
- `obfuscatedRevenue`: Privacy-protected revenue
- `obfuscatedRides`: Privacy-protected rides
- `decryptionCompleted`: Whether decryption succeeded

**Note**: `publicRevenue` and `publicRides` only available if `periodClosed` is true

---

### getObfuscatedAverageSpending()

Get privacy-preserving average spending per participant.

```solidity
function getObfuscatedAverageSpending(uint32 periodNumber)
    external view returns (uint256)
```

**Parameters**:
- `periodNumber` (uint32): Period to query

**Returns**:
- `uint256`: Obfuscated average spending (with random multiplier applied)

**Requirements**:
- Period must be closed
- Minimum 3 participants

**Errors**:
- `PeriodNotClosed()` - Period still active
- `InsufficientParticipants()` - Less than 3 participants

**Privacy Note**: Returned value includes random multiplier (50%-150% of true average)

---

### getObfuscatedAverageRides()

Get privacy-preserving average rides per participant.

```solidity
function getObfuscatedAverageRides(uint32 periodNumber)
    external view returns (uint256)
```

Similar to `getObfuscatedAverageSpending()` but for ride counts.

---

### getDecryptionStatus()

Check decryption request status and timeout.

```solidity
function getDecryptionStatus(uint32 periodNumber) external view returns (
    bool hasRequest,
    uint256 requestId,
    uint256 requestTime,
    bool completed,
    bool timedOut
)
```

**Parameters**:
- `periodNumber` (uint32): Period to check

**Returns**:
- `hasRequest`: Whether decryption requested
- `requestId`: Gateway request ID
- `requestTime`: Request timestamp
- `completed`: Whether callback received
- `timedOut`: Whether timeout exceeded (>1 hour)

**Use Case**: Monitor decryption progress and detect failures

---

### isOddHourWindow()

Check if current time is odd hour window (submission active).

```solidity
function isOddHourWindow() public view returns (bool)
```

**Returns**: `true` if current hour is odd (UTC+3: 13:00, 15:00, 17:00, etc.)

---

### isEvenHourWindow()

Check if current time is even hour window (analysis active).

```solidity
function isEvenHourWindow() public view returns (bool)
```

**Returns**: `true` if current hour is even (UTC+3: 14:00, 16:00, 18:00, etc.)

---

### isSubmissionActive()

Check if data submission currently allowed.

```solidity
function isSubmissionActive() public view returns (bool)
```

**Returns**: `true` if submission window open

---

### isAnalysisActive()

Check if analysis can be triggered.

```solidity
function isAnalysisActive() public view returns (bool)
```

**Returns**: `true` if analysis window open

---

### getCurrentAdjustedHour()

Get current hour in UTC+3 timezone.

```solidity
function getCurrentAdjustedHour() external view returns (uint256)
```

**Returns**: Hour (0-23) in UTC+3

---

### isPauser()

Check if address has pauser role.

```solidity
function isPauser(address _address) external view returns (bool)
```

---

### getContractStatus()

Get overall contract state.

```solidity
function getContractStatus() external view returns (
    bool _paused,
    uint256 _pauserCount,
    uint32 _currentPeriod,
    bool _locked
)
```

**Returns**:
- `_paused`: Contract pause state
- `_pauserCount`: Number of authorized pausers
- `_currentPeriod`: Current period number
- `_locked`: Reentrancy lock state

---

## Events

### PeriodStarted
```solidity
event PeriodStarted(uint32 indexed period, uint256 startTime, address indexed initiator)
```
Emitted when new period initialized.

### DataSubmitted
```solidity
event DataSubmitted(address indexed cardHolder, uint32 indexed period, uint256 timestamp, uint256 stakeAmount)
```
Emitted when user submits data.

### AnalysisRequested
```solidity
event AnalysisRequested(uint32 indexed period, uint256 requestId, uint256 timestamp)
```
Emitted when decryption requested from Gateway.

### PeriodAnalyzed
```solidity
event PeriodAnalyzed(uint32 indexed period, uint32 totalRevenue, uint32 totalRides, uint256 participantCount)
```
Emitted when period successfully analyzed.

### DecryptionTimedOut
```solidity
event DecryptionTimedOut(uint32 indexed period, uint256 requestId)
```
Emitted when decryption exceeds timeout.

### RefundProcessed
```solidity
event RefundProcessed(address indexed user, uint32 indexed period, uint256 amount)
```
Emitted when stake refunded.

### PriceObfuscated
```solidity
event PriceObfuscated(uint32 indexed period, uint256 multiplier)
```
Emitted when privacy obfuscation applied.

### GatewayCallbackReceived
```solidity
event GatewayCallbackReceived(uint256 indexed requestId, bool success)
```
Emitted when Gateway callback processed.

---

## Error Codes

### Access Control Errors
- `NotAuthorized()` - Caller not transit authority
- `NotPauser()` - Caller not authorized pauser
- `ZeroAddress()` - Invalid zero address provided

### Timing Errors
- `NotSubmissionWindow()` - Called outside submission window
- `NotAnalysisWindow()` - Called outside analysis window
- `OnlyOddHoursAllowed()` - Operation requires odd hour
- `DecryptionTimeout()` - Timeout not yet exceeded

### State Errors
- `PeriodAlreadyActive()` - Period already initialized
- `PeriodAlreadyClosed()` - Period already analyzed
- `NoPeriodActive()` - No valid period
- `NoDataCollected()` - No data submitted
- `DataAlreadySubmitted()` - User already submitted this period
- `ContractPaused()` - Contract in paused state

### Validation Errors
- `InvalidSpendingAmount()` - Spending exceeds limit or stake too low
- `InvalidRidesCount()` - Rides exceed limit
- `InsufficientParticipants()` - Less than minimum participants
- `MaxPeriodsReached()` - Period limit exceeded

### Refund Errors
- `RefundAlreadyProcessed()` - Refund already claimed
- `NoRefundAvailable()` - No refund eligible
- `DecryptionFailed()` - Decryption request failed

### Security Errors
- `ReentrancyGuard()` - Reentrancy attempt detected

---

## Data Structures

### CardTransaction
```solidity
struct CardTransaction {
    euint32 encryptedSpending;  // FHE-encrypted spending
    euint8 encryptedRides;      // FHE-encrypted rides
    ebool isValid;              // FHE-encrypted validation flag
    bool hasData;               // Submission flag
    uint256 timestamp;          // Submission time
    bool refundProcessed;       // Refund status
    uint256 stakeAmount;        // Stake amount (wei)
}
```

### AnalysisPeriod
```solidity
struct AnalysisPeriod {
    euint32 totalRevenue;           // FHE-encrypted aggregate revenue
    euint32 totalRides;             // FHE-encrypted aggregate rides
    ebool hasMinimumData;           // FHE-encrypted minimum check
    bool dataCollected;             // Period active flag
    bool periodClosed;              // Analysis complete flag
    uint32 publicRevenue;           // Decrypted revenue (cents)
    uint32 publicRides;             // Decrypted rides
    uint256 startTime;              // Period start
    uint256 endTime;                // Period close
    address[] participants;         // Participant list
    uint256 decryptionRequestId;    // Gateway request ID
    uint256 decryptionRequestTime;  // Request timestamp
    bool decryptionCompleted;       // Callback received
    uint256 randomMultiplier;       // Privacy multiplier (500-1500)
    uint256 obfuscatedRevenue;      // Privacy-protected value
    uint256 obfuscatedRides;        // Privacy-protected value
}
```

### DecryptionRequest
```solidity
struct DecryptionRequest {
    uint256 requestId;    // Unique identifier
    uint256 timestamp;    // Request time
    bool completed;       // Callback received
    bool failed;          // Timeout/error occurred
    uint32 periodId;      // Associated period
}
```

---

## Constants

```solidity
uint256 constant UTC_OFFSET = 10800;              // UTC+3 (seconds)
uint32 constant MAX_SPENDING = 1000000;           // $10,000 in cents
uint8 constant MAX_RIDES = 100;                   // Max rides per period
uint256 constant DECRYPTION_TIMEOUT = 1 hours;    // Gateway timeout
uint256 constant MIN_PARTICIPANTS = 3;            // Privacy threshold
uint256 constant OBFUSCATION_MULTIPLIER = 1000;   // Division privacy base
uint256 constant MAX_PERIODS = 1000;              // Period limit
```

---

## Usage Examples

### Complete Workflow

```javascript
// 1. Initialize period (odd hour)
await contract.initializePeriod();

// 2. Multiple users submit data
const users = [user1, user2, user3, user4, user5];
for (const user of users) {
    await contract.connect(user).submitCardDataPlain(
        Math.floor(Math.random() * 10000),  // Random spending
        Math.floor(Math.random() * 20),     // Random rides
        { value: ethers.parseEther("0.001") }
    );
}

// 3. Wait for even hour, then trigger analysis
await contract.performAnalysis();

// 4. Monitor decryption status
const status = await contract.getDecryptionStatus(currentPeriod);
console.log(`Request ${status.requestId}: ${status.completed ? 'Completed' : 'Pending'}`);

// 5. If timeout occurs, handle it
if (status.timedOut && !status.completed) {
    await contract.handleDecryptionTimeout(currentPeriod);
    await contract.connect(user1).claimRefund(currentPeriod);
}

// 6. View results (if successful)
const history = await contract.getPeriodHistory(currentPeriod);
const avgSpending = await contract.getObfuscatedAverageSpending(currentPeriod);
console.log(`Average spending: ${avgSpending} cents (obfuscated)`);
```

---

## Integration Guide

### Frontend Integration

```javascript
import { createFhevmInstance } from 'fhevmjs';

// Initialize FHEVM
const fhevm = await createFhevmInstance({
    network: 'sepolia',
    gatewayUrl: 'https://gateway.sepolia.zama.ai'
});

// Submit encrypted data
async function submitTransitData(spending, rides) {
    const encSpending = await fhevm.encrypt32(spending);
    const encRides = await fhevm.encrypt8(rides);

    const tx = await contract.submitCardData(
        encSpending,
        encRides,
        { value: ethers.parseEther("0.001") }
    );

    await tx.wait();
    console.log("Data submitted successfully");
}

// Monitor period status
async function monitorPeriod(periodId) {
    const filter = contract.filters.PeriodAnalyzed(periodId);
    contract.on(filter, (period, revenue, rides, participants) => {
        console.log(`Period ${period} analyzed:`);
        console.log(`Revenue: $${revenue / 100}, Rides: ${rides}, Participants: ${participants}`);
    });
}
```

---

## Gas Optimization Tips

1. **Batch Submissions**: Submit during early submission window to avoid congestion
2. **Use Plain Submission**: If privacy not critical, `submitCardDataPlain()` cheaper than encrypted
3. **Monitor Timeout**: Trigger `handleDecryptionTimeout()` promptly to enable refunds
4. **Event Listening**: Subscribe to events rather than polling view functions

---

## Security Best Practices

1. **Validate Inputs**: Always check return values from view functions
2. **Handle Timeouts**: Implement timeout monitoring in frontend
3. **Stake Management**: Ensure sufficient ETH for stakes
4. **Privacy Awareness**: Use obfuscated values for public display
5. **Multi-Sig Authority**: Use Gnosis Safe or similar for admin functions

---

*For architecture details and security considerations, see [ARCHITECTURE.md](./ARCHITECTURE.md)*
*For security audit information, see [SECURITY.md](./SECURITY.md)*
