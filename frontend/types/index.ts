export interface PeriodInfo {
  period: number
  dataCollected: boolean
  periodClosed: boolean
  startTime: bigint
  participantCount: bigint
}

export interface ContractStatus {
  paused: boolean
  pauserCount: bigint
  currentPeriod: number
}

export interface CardDataStatus {
  hasData: boolean
  timestamp: bigint
}

export interface PeriodHistory {
  periodClosed: boolean
  publicRevenue: number
  publicRides: number
  startTime: bigint
  endTime: bigint
  participantCount: bigint
}

export interface TransactionRecord {
  hash: string
  type: 'init' | 'submit' | 'analyze' | 'pause' | 'unpause'
  status: 'pending' | 'success' | 'error'
  timestamp: number
  period?: number
  spending?: number
  rides?: number
  error?: string
}

export interface TimeWindow {
  currentHour: number
  isOddHour: boolean
  isEvenHour: boolean
  submissionActive: boolean
  analysisActive: boolean
}
