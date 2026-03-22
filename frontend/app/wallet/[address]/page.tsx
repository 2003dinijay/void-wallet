'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getWalletByAddress } from '@/lib/api'
import HashDisplay from '@/components/HashDisplay'

export default function WalletSharePage() {
  const { address } = useParams<{ address: string }>()
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getWalletByAddress(address)
      .then(setWallet)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [address])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="text-void-muted font-mono text-sm py-20 text-center">Loading wallet...</div>
  if (error) return (
    <div className="py-20 text-center space-y-4">
      <div className="text-red-400 font-mono text-sm">{error}</div>
      <Link href="/dashboard" className="text-eth-green text-sm hover:underline">← Back to dashboard</Link>
    </div>
  )
  if (!wallet) return null

  const isEth = wallet.chain === 'eth'
  const accent = isEth ? 'text-eth-green' : 'text-sol-purple'
  const badgeBg = isEth ? 'bg-eth-green/10 border-eth-green/30 text-eth-green' : 'bg-sol-purple/10 border-sol-purple/30 text-sol-purple'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-void-muted text-xs hover:text-void-text font-mono transition-colors">
          ← Dashboard
        </Link>
        <button
          onClick={copyLink}
          className="px-3 py-1.5 border border-void-border text-void-muted rounded font-mono text-xs hover:text-white hover:border-void-text transition-all"
        >
          {copied ? '✓ Link copied' : 'Copy share link'}
        </button>
      </div>

      {/* Wallet Card */}
      <div className="bg-void-surface border border-void-border rounded-xl p-6 space-y-5">
        {/* Title row */}
        <div className="flex items-center gap-3">
          <span className={`border rounded px-2 py-0.5 font-mono text-xs font-bold ${badgeBg}`}>
            {wallet.chain.toUpperCase()}
          </span>
          <h1 className="font-display text-xl font-bold text-white">{wallet.name}</h1>
          <span className="ml-auto text-xs text-void-muted border border-void-border rounded px-2 py-0.5 font-mono">
            public wallet
          </span>
        </div>

        {/* Owner */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-void-muted text-xs">Owned by</span>
          <span className={`font-mono text-sm font-bold ${accent}`}>@{wallet.username}</span>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <HashDisplay
            label={isEth ? 'Ethereum Address' : 'Solana Address (Base58)'}
            value={wallet.address}
            copiable
            accent={isEth ? 'eth' : 'sol'}
          />
          <HashDisplay
            label="Public Key"
            value={wallet.public_key}
            copiable
          />
          <div className="bg-void-bg border border-void-border rounded-lg p-3 space-y-1">
            <div className="text-xs text-void-muted">Derivation Path</div>
            <div className={`font-mono text-sm ${accent}`}>{wallet.derivation_path}</div>
          </div>
        </div>

        {/* Meta */}
        <div className="pt-3 border-t border-void-border flex items-center justify-between text-xs text-void-muted font-mono">
          <span>Created {new Date(wallet.created_at).toLocaleDateString()}</span>
          <span className={isEth ? 'text-eth-green' : 'text-sol-purple'}>
            {isEth ? 'secp256k1 · ECDSA' : 'Curve25519 · Ed25519'}
          </span>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-void-surface border border-void-border rounded-xl p-4 text-xs text-void-muted space-y-1">
        <p>✓ This page only shows the <strong className="text-void-text">public address and public key</strong>.</p>
        <p>✓ The private key is never stored — only the wallet owner holds it.</p>
        <p>✓ You can safely share this link — no sensitive data is exposed.</p>
      </div>
    </div>
  )
}
