'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useContractWrite } from '@/lib/hooks/useContract'
import { useTransactionHistory } from '@/lib/hooks/useTransactionHistory'
import { toast } from '@/lib/hooks/useToast'
import { Send, Loader2 } from 'lucide-react'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract'
import { useAccount } from 'wagmi'

export function DataSubmissionForm() {
  const { address } = useAccount()
  const [spending, setSpending] = useState('')
  const [rides, setRides] = useState('')
  const { writeContract, isPending, isConfirming, hash } = useContractWrite()
  const { addTransaction } = useTransactionHistory()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!spending || !rides) {
      toast({
        variant: 'warning',
        title: 'Missing Data',
        description: 'Please enter both spending amount and number of rides',
      })
      return
    }

    if (!address) {
      toast({
        variant: 'error',
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
      })
      return
    }

    try {
      const spendingAmount = Math.round(parseFloat(spending) * 100) // Convert to cents
      const rideCount = parseInt(rides)

      if (spendingAmount <= 0 || rideCount <= 0) {
        toast({
          variant: 'warning',
          title: 'Invalid Values',
          description: 'Please enter positive numbers',
        })
        return
      }

      writeContract(
        {
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'submitData',
          args: [BigInt(spendingAmount), BigInt(rideCount)],
        },
        {
          onSuccess: (hash) => {
            addTransaction({
              hash,
              type: 'submit',
              status: 'pending',
              timestamp: Date.now(),
              spending: spendingAmount,
              rides: rideCount,
            })
            toast({
              variant: 'info',
              title: 'Transaction Sent',
              description: 'Please wait for confirmation...',
            })
          },
          onError: (error: any) => {
            const errorMessage = error?.shortMessage || error?.message || 'Transaction failed'
            toast({
              variant: 'error',
              title: 'Transaction Failed',
              description: errorMessage,
            })
          },
        }
      )
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to submit data',
      })
    }
  }

  const isLoading = isPending || isConfirming

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-[var(--accent)]" />
          Submit Encrypted Data
        </CardTitle>
        <CardDescription>
          Submit your transit card usage data. All data is encrypted using FHE for privacy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Total Spending (USD)"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g., 25.50"
            value={spending}
            onChange={(e) => setSpending(e.target.value)}
            disabled={isLoading}
            helperText="Your spending amount will be encrypted"
          />

          <Input
            label="Number of Rides"
            type="number"
            min="0"
            placeholder="e.g., 10"
            value={rides}
            onChange={(e) => setRides(e.target.value)}
            disabled={isLoading}
            helperText="Total number of rides taken"
          />

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !address}
              loading={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? 'Submitting...' : 'Submit Data'}
            </Button>

            {hash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--accent)] hover:underline mono"
              >
                View Transaction
              </a>
            )}
          </div>

          {!address && (
            <p className="text-xs text-[var(--warning)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]"></span>
              Please connect your wallet to submit data
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
