export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` || '0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c'

export const CONTRACT_ABI = [
  // Read functions
  'function transitAuthority() view returns (address)',
  'function currentPeriod() view returns (uint32)',
  'function paused() view returns (bool)',
  'function pauserCount() view returns (uint256)',
  'function getCurrentAdjustedHour() view returns (uint256)',
  'function isOddHourWindow() view returns (bool)',
  'function isEvenHourWindow() view returns (bool)',
  'function isSubmissionActive() view returns (bool)',
  'function isAnalysisActive() view returns (bool)',
  'function getCurrentPeriodInfo() view returns (uint32 period, bool dataCollected, bool periodClosed, uint256 startTime, uint256 participantCount)',
  'function isPauser(address) view returns (bool)',
  'function getContractStatus() view returns (bool _paused, uint256 _pauserCount, uint32 _currentPeriod)',
  'function getCardDataStatus(address cardHolder) view returns (bool hasData, uint256 timestamp)',
  'function getPeriodHistory(uint32 periodNumber) view returns (bool periodClosed, uint32 publicRevenue, uint32 publicRides, uint256 startTime, uint256 endTime, uint256 participantCount)',
  'function getAverageSpending(uint32 periodNumber) view returns (uint256)',
  'function getAverageRides(uint32 periodNumber) view returns (uint256)',

  // Write functions
  'function initializePeriod()',
  'function submitCardDataPlain(uint32 _spending, uint8 _rides)',
  'function performAnalysis() returns (uint256)',
  'function pause()',
  'function unpause()',

  // Events
  'event PeriodStarted(uint32 indexed period, uint256 startTime, address indexed initiator)',
  'event DataSubmitted(address indexed cardHolder, uint32 indexed period, uint256 timestamp)',
  'event AnalysisRequested(uint32 indexed period, uint256 requestId, uint256 timestamp)',
  'event PeriodAnalyzed(uint32 indexed period, uint32 totalRevenue, uint32 totalRides, uint256 participantCount)',
  'event Paused(address indexed pauser, uint256 timestamp)',
  'event Unpaused(address indexed pauser, uint256 timestamp)',
] as const
