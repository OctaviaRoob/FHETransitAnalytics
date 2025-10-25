'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTransactionHistory } from '@/lib/hooks/useTransactionHistory'
import { Clock, ExternalLink, Trash2, Send, BarChart3, Activity } from 'lucide-react'
import { formatAddress, formatDate } from '@/lib/utils'

const typeIcons = {
  init: Activity,
  submit: Send,
  analyze: BarChart3,
  pause: Clock,
  unpause: Clock,
}

const typeLabels = {
  init: 'Initialize Period',
  submit: 'Submit Data',
  analyze: 'Perform Analysis',
  pause: 'Pause Contract',
  unpause: 'Unpause Contract',
}

export function TransactionHistory() {
  const { transactions, clearHistory } = useTransactionHistory()

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--accent)]" />
            Transaction History
          </CardTitle>
          <CardDescription>Your recent transactions will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="glass-panel p-8 text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-muted)] opacity-50" />
            <p className="text-sm text-[var(--color-text-muted)]">
              No transactions yet. Start by submitting data or performing analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--accent)]" />
              Transaction History
            </CardTitle>
            <CardDescription>Track all your contract interactions</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="text-[var(--error)]"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((tx) => {
            const Icon = typeIcons[tx.type] || Send
            const statusColors = {
              pending: 'badge-info',
              success: 'badge-success',
              error: 'badge-error',
            }

            return (
              <div
                key={tx.hash}
                className="glass-panel p-4 hover:border-[var(--color-border-strong)] transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      <Icon className="w-5 h-5 text-[var(--accent)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">
                          {typeLabels[tx.type]}
                        </p>
                        <span className={`badge ${statusColors[tx.status]}`}>
                          {tx.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-[var(--color-text-muted)]">
                        <div className="flex items-center gap-2 mono">
                          <span>TX:</span>
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent)] hover:underline flex items-center gap-1"
                          >
                            {formatAddress(tx.hash)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        {tx.spending && tx.rides && (
                          <div className="flex items-center gap-3">
                            <span>
                              Spending: ${(tx.spending / 100).toFixed(2)}
                            </span>
                            <span className="text-[var(--color-border)]">•</span>
                            <span>Rides: {tx.rides}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {formatDate(tx.timestamp)}
                        </div>
                      </div>

                      {tx.error && (
                        <div className="mt-2 text-xs text-[var(--error)] bg-[var(--error-soft)] px-2 py-1 rounded">
                          {tx.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
