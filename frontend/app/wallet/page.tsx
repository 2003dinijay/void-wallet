'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { generateEthWallet, generateSolWallet, saveWallet } from '@/lib/api'
import { isLoggedIn } from '@/lib/auth'
import StepVisualizer from '@/components/StepVisualizer'
import HashDisplay from '@/components/HashDisplay'
import Link from 'next/link'

function WalletPageContent() {
  const searchParams = useSearchParams()
  const [chain, setChain] = useState<'eth' | 'sol'>('eth')
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletName, setWalletName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const loggedIn = isLoggedIn()

  useEffect(() => {
    const c = searchParams.get('chain')
    if (c === 'sol') setChain('sol')
    else setChain('eth')
  }, [searchParams])

  const generate = async () => {
    setLoading(true)
    setError(null)
    setWallet(null)
    setSaved(false)
    setSaveError('')
    try {
      const data = chain === 'eth' ? await generateEthWallet() : await generateSolWallet()
      setWallet(data)
      setWalletName(`My ${chain.toUpperCase()} Wallet`)
    } catch (e: any) {
      setError(e.message || 'Failed to connect to backend. Make sure the Python server is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!wallet) return
    setSaving(true)
    setSaveError('')
    try {
      await saveWallet({
        chain,
        address: chain === 'eth' ? wallet.address : wallet.public_key_base58,
        public_key: chain === 'eth' ? wallet.public_key : wallet.public_key_hex,
        derivation_path: wallet.derivation_path,
        name: walletName || `My ${chain.toUpperCase()} Wallet`,
        is_public: true,
      })
      setSaved(true)
    } catch (e: any) {
      setSaveError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const isEth = chain === 'eth'
  const accent = isEth ? 'text-eth-green' : 'text-sol-purple'

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-white">Wallet Generator</h1>
        <p className="text-void-muted text-sm">Generate a cryptographic key pair from entropy — watch every step of the derivation pipeline.</p>
      </div>

      {/* Chain Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => { setChain('eth'); setWallet(null); setSaved(false) }}
          className={`px-4 py-2 rounded-lg font-mono text-sm border transition-all ${chain === 'eth' ? 'bg-eth-green/10 border-eth-green text-eth-green' : 'border-void-border text-void-muted hover:border-eth-green/40'}`}
        >Ethereum (ECDSA)</button>
        <button
          onClick={() => { setChain('sol'); setWallet(null); setSaved(false) }}
          className={`px-4 py-2 rounded-lg font-mono text-sm border transition-all ${chain === 'sol' ? 'bg-sol-purple/10 border-sol-purple text-sol-purple' : 'border-void-border text-void-muted hover:border-sol-purple/40'}`}
        >Solana (Ed25519)</button>
      </div>

      {/* Generate Button */}
      <button
        onClick={generate}
        disabled={loading}
        className={`px-8 py-4 rounded-xl font-mono text-sm border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 ${isEth ? 'bg-eth-green/10 hover:bg-eth-green/20 border-eth-green/40 text-eth-green' : 'bg-sol-purple/10 hover:bg-sol-purple/20 border-sol-purple/40 text-sol-purple'}`}
      >
        {loading ? <><span className="animate-spin inline-block">◌</span> Generating...</> : <><span>⚡</span> Generate {isEth ? 'Ethereum' : 'Solana'} Wallet</>}
      </button>

      {error && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-lg p-4 text-red-400 text-sm font-mono">{error}</div>
      )}

      {wallet && (
        <div className="space-y-6">
          {/* Wallet Info */}
          <div className="bg-void-surface border border-void-border rounded-xl p-6 space-y-4">
            <h2 className={`font-display text-xl font-bold ${accent}`}>
              {isEth ? 'Ethereum' : 'Solana'} Wallet Generated
            </h2>

            <HashDisplay label="Mnemonic Phrase (12 words)" value={wallet.mnemonic} blurred copiable />
            <HashDisplay label="Private Key ⚠️" value={isEth ? wallet.private_key : wallet.private_key_hex} blurred copiable warning />
            <HashDisplay label="Public Key" value={isEth ? wallet.public_key : wallet.public_key_hex} copiable />
            {isEth
              ? <HashDisplay label="Ethereum Address" value={wallet.address} copiable accent="eth" />
              : <HashDisplay label="Solana Address (Base58)" value={wallet.public_key_base58} copiable accent="sol" />
            }
            <div className="text-xs text-void-muted font-mono">
              Derivation Path: <span className={accent}>{wallet.derivation_path}</span>
            </div>

            {/* Save to account */}
            <div className="pt-4 border-t border-void-border space-y-3">
              {!loggedIn ? (
                <p className="text-xs text-void-muted font-mono">
                  <Link href="/login" className="text-eth-green hover:underline">Sign in</Link> to save this wallet to your account and get a shareable link.
                </p>
              ) : saved ? (
                <div className="flex items-center gap-3">
                  <span className="text-green-400 text-sm font-mono">✓ Wallet saved!</span>
                  <Link
                    href={`/wallet/${isEth ? wallet.address : wallet.public_key_base58}`}
                    className="text-xs text-eth-green hover:underline font-mono"
                  >
                    View share page →
                  </Link>
                </div>
              ) : (
                <div className="flex gap-3 flex-wrap items-center">
                  <input
                    value={walletName}
                    onChange={e => setWalletName(e.target.value)}
                    placeholder="Wallet name..."
                    className="flex-1 min-w-[160px] bg-void-bg border border-void-border focus:border-eth-green rounded-lg px-3 py-2 font-mono text-sm text-void-text outline-none transition-colors"
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-4 py-2 rounded-lg font-mono text-sm border transition-all disabled:opacity-40 ${isEth ? 'bg-eth-green/10 border-eth-green/40 text-eth-green hover:bg-eth-green/20' : 'bg-sol-purple/10 border-sol-purple/40 text-sol-purple hover:bg-sol-purple/20'}`}
                  >
                    {saving ? 'Saving...' : 'Save to Account'}
                  </button>
                  {saveError && <span className="text-red-400 text-xs font-mono">{saveError}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Steps */}
          {wallet.steps && (
            <div className="space-y-3">
              <h2 className="font-display text-xl font-bold text-white">Cryptographic Steps</h2>
              <StepVisualizer steps={wallet.steps} chain={chain} />
            </div>
          )}

          {/* Explainer */}
          <div className="bg-void-surface border border-void-border rounded-xl p-6 space-y-3">
            <h3 className="font-display font-bold text-white">What just happened?</h3>
            {isEth ? (
              <div className="text-sm text-void-text space-y-2">
                <p>1. Generated <span className="text-eth-green">128 bits of random entropy</span> via OS CSPRNG.</p>
                <p>2. Converted to a <span className="text-eth-green">12-word BIP-39 mnemonic</span> via SHA-256 checksum + wordlist.</p>
                <p>3. Stretched to a <span className="text-eth-green">512-bit seed</span> using PBKDF2-HMAC-SHA512 (2048 rounds).</p>
                <p>4. Derived child private key at <span className="text-eth-green">m/44&apos;/60&apos;/0&apos;/0/0</span> via BIP-32 HMAC-SHA512 chain.</p>
                <p>5. Multiplied private key by <span className="text-eth-green">secp256k1 generator G</span> → public key.</p>
                <p>6. <span className="text-eth-green">Keccak-256</span> hashed the public key.</p>
                <p>7. Last 20 bytes → address with <span className="text-eth-green">EIP-55 checksum</span>.</p>
              </div>
            ) : (
              <div className="text-sm text-void-text space-y-2">
                <p>1. Generated <span className="text-sol-purple">128 bits of random entropy</span>.</p>
                <p>2. Converted to <span className="text-sol-purple">12-word BIP-39 mnemonic</span>.</p>
                <p>3. Stretched to <span className="text-sol-purple">512-bit seed</span> using PBKDF2-HMAC-SHA512.</p>
                <p>4. Derived at <span className="text-sol-purple">m/44&apos;/501&apos;/0&apos;/0&apos;</span> (Solana path, all hardened).</p>
                <p>5. Seed → <span className="text-sol-purple">Ed25519 keypair</span> over Curve25519.</p>
                <p>6. Public key <span className="text-sol-purple">Base58-encoded</span> directly as the address (no hashing).</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="text-void-muted font-mono text-sm">Loading...</div>}>
      <WalletPageContent />
    </Suspense>
  )
}
