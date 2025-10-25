'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useContractRead } from '@/lib/hooks/useContract'
import { Loader2, Lock, Users, Calendar } from 'lucide-react'
import { formatAddress } from '@/lib/utils'

export function ContractStatus() {
  const { data: authority, isLoading: authLoading } = useContractRead('transitAuthority')
  const { data: currentPeriod, isLoading: periodLoading } = useContractRead('currentPeriod')
  const { data: isPaused, isLoading: pausedLoading } = useContractRead('paused')

  const isLoading = authLoading || periodLoading || pausedLoading

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-[var(--accent)]" />
          Contract Status
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-label">Transit Authority</div>
          <div className="stat-value text-sm mono break-all">
            {authority ? formatAddress(authority as string) : 'N/A'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            Current Period
          </div>
          <div className="stat-value">
            #{currentPeriod?.toString() || '0'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            Contract Status
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`badge ${isPaused ? 'badge-error' : 'badge-success'}`}>
              {isPaused ? 'Paused' : 'Active'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
