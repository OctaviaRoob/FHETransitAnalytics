'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useContractWrite, useContractRead } from '@/lib/hooks/useContract'
import { useTransactionHistory } from '@/lib/hooks/useTransactionHistory'
import { toast } from '@/lib/hooks/useToast'
import { BarChart3, Loader2, TrendingUp, DollarSign, Activity } from 'lucide-react'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract'
import { useAccount } from 'wagmi'
import { formatCurrency } from '@/lib/utils'

export function AnalysisPanel() {
  const { address } = useAccount()
  const { writeContract, isPending, isConfirming } = useContractWrite()
  const { addTransaction } = useTransactionHistory()

  // Read period info
  const { data: currentPeriod } = useContractRead('currentPeriod')
  const { data: periodInfo, refetch: refetchPeriod } = useContractRead('getPeriodInfo', [currentPeriod])

  const handleAnalyze = async () => {
    if (!address) {
      toast({
        variant: 'error',
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
      })
      return
    }

    try {
      writeContract(
        {
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'performAnalysis',
        },
        {
          onSuccess: (hash) => {
            addTransaction({
              hash,
              type: 'analyze',
              status: 'pending',
              timestamp: Date.now(),
            })
            toast({
              variant: 'info',
              title: 'Analysis Started',
              description: 'Computing encrypted analytics...',
            })
          },
          onError: (error: any) => {
            const errorMessage = error?.shortMessage || error?.message || 'Analysis failed'
            toast({
              variant: 'error',
              title: 'Analysis Failed',
              description: errorMessage,
            })
          },
        }
      )
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to perform analysis',
      })
    }
  }

  const handleInitialize = async () => {
    if (!address) {
      toast({
        variant: 'error',
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
      })
      return
    }

    try {
      writeContract(
        {
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'initializePeriod',
        },
        {
          onSuccess: (hash) => {
            addTransaction({
              hash,
              type: 'init',
              status: 'pending',
              timestamp: Date.now(),
            })
            toast({
              variant: 'info',
              title: 'Period Initialized',
              description: 'New collection period started',
            })
          },
          onError: (error: any) => {
            const errorMessage = error?.shortMessage || error?.message || 'Initialization failed'
            toast({
              variant: 'error',
              title: 'Initialization Failed',
              description: errorMessage,
            })
          },
        }
      )
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to initialize period',
      })
    }
  }

  const isLoading = isPending || isConfirming
  const dataCollected = periodInfo?.[1] || false
  const periodClosed = periodInfo?.[2] || false
  const participantCount = periodInfo?.[4] ? Number(periodInfo[4]) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[var(--success)]" />
          Analytics & Management
        </CardTitle>
        <CardDescription>
          Perform FHE-based analytics on encrypted transit data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Period Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="stat-card">
            <div className="stat-label flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              Participants
            </div>
            <div className="stat-value text-2xl">{participantCount}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Data Status</div>
            <span className={`badge ${dataCollected ? 'badge-success' : 'badge-info'}`}>
              {dataCollected ? 'Collected' : 'Open'}
            </span>
          </div>

          <div className="stat-card">
            <div className="stat-label">Period Status</div>
            <span className={`badge ${periodClosed ? 'badge-error' : 'badge-success'}`}>
              {periodClosed ? 'Closed' : 'Active'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-3 pt-2">
          <Button
            onClick={handleAnalyze}
            variant="success"
            disabled={isLoading || !address || !dataCollected}
            loading={isLoading && isPending}
            className="flex-1"
          >
            <TrendingUp className="w-4 h-4" />
            Perform Analysis
          </Button>

          <Button
            onClick={handleInitialize}
            variant="secondary"
            disabled={isLoading || !address}
            loading={isLoading && isPending}
            className="flex-1"
          >
            <Activity className="w-4 h-4" />
            Initialize Period
          </Button>
        </div>

        {!dataCollected && participantCount === 0 && (
          <div className="glass-panel p-4 border-[var(--info-soft)]">
            <p className="text-sm text-[var(--color-text-muted)]">
              No data submitted for this period yet. Submit data first before performing analysis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
