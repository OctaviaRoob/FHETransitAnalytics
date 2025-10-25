'use client'

import { useState, useEffect } from 'react'
import { TransactionRecord } from '@/types'

const STORAGE_KEY = 'transit_analytics_transactions'

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setTransactions(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse stored transactions', e)
      }
    }
  }, [])

  const addTransaction = (tx: TransactionRecord) => {
    setTransactions(prev => {
      const updated = [tx, ...prev].slice(0, 50) // Keep last 50
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const updateTransaction = (hash: string, updates: Partial<TransactionRecord>) => {
    setTransactions(prev => {
      const updated = prev.map(tx =>
        tx.hash === hash ? { ...tx, ...updates } : tx
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const clearHistory = () => {
    setTransactions([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    transactions,
    addTransaction,
    updateTransaction,
    clearHistory,
  }
}
