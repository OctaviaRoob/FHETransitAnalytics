'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { ContractStatus } from '@/components/ContractStatus'
import { DataSubmissionForm } from '@/components/DataSubmissionForm'
import { AnalysisPanel } from '@/components/AnalysisPanel'
import { TransactionHistory } from '@/components/TransactionHistory'
import { Shield, Github, ExternalLink } from 'lucide-react'
import { CONTRACT_ADDRESS } from '@/config/contract'
import { formatAddress } from '@/lib/utils'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] backdrop-blur-xl bg-[var(--color-panel)] sticky top-0 z-50">
        <div className="container-main">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Transit Analytics</h1>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Privacy-Preserving Analytics Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/OctaviaRoob/ConfidentialTransitAnalytics"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-panel-alt)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-all"
              >
                <Github className="w-4 h-4" />
                <span className="text-sm">Source</span>
              </a>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-main">
        {/* Hero Section */}
        <div className="py-8 md:py-12">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-border)] mb-4">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
              <span className="text-sm font-medium text-[var(--accent)]">
                Powered by FHE Technology
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Privacy-First Transit Analytics
            </h2>

            <p className="text-base md:text-lg text-[var(--color-text-muted)] mb-6">
              Submit encrypted transit card data and perform secure analytics using
              Fully Homomorphic Encryption (FHE) on the blockchain.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--success)]"></div>
                <span className="text-[var(--color-text-muted)]">End-to-End Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--success)]"></div>
                <span className="text-[var(--color-text-muted)]">On-Chain Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--success)]"></div>
                <span className="text-[var(--color-text-muted)]">Zero Knowledge Proofs</span>
              </div>
            </div>
          </div>

          {/* Contract Info Banner */}
          <div className="glass-panel p-4 mb-8 max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="text-center md:text-left">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">
                  Smart Contract Address
                </p>
                <p className="font-mono text-sm">{formatAddress(CONTRACT_ADDRESS)}</p>
              </div>
              <a
                href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-panel-alt)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-all text-sm"
              >
                <span>View on Etherscan</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Connection Prompt */}
          {!isConnected && (
            <div className="glass-panel p-8 text-center max-w-lg mx-auto mb-8">
              <Shield className="w-16 h-16 mx-auto mb-4 text-[var(--accent)]" />
              <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-[var(--color-text-muted)] mb-6">
                Connect your wallet to start submitting encrypted data and performing analytics
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          {isConnected && (
            <div className="space-y-6">
              {/* Contract Status */}
              <ContractStatus />

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DataSubmissionForm />
                <AnalysisPanel />
              </div>

              {/* Transaction History */}
              <TransactionHistory />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] mt-16">
        <div className="container-main py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text-muted)]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Transit Analytics © 2025</span>
            </div>

            <div className="flex items-center gap-6">
              <a
                href="https://docs.zama.ai/fhevm"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--accent)] transition-colors"
              >
                FHE Documentation
              </a>
              <a
                href="https://github.com/OctaviaRoob/ConfidentialTransitAnalytics"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--accent)] transition-colors flex items-center gap-1"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
