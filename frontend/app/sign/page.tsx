'use client'
import { useState } from 'react'
import { signEthTransaction, signSolTransaction } from '@/lib/api'
import StepVisualizer from '@/components/StepVisualizer'
import HashDisplay from '@/components/HashDisplay'

export default function SignPage() {
  const [chain, setChain] = useState<'eth' | 'sol'>('eth')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  // ETH fields
  const [ethPrivKey, setEthPrivKey] = useState('')
  const [ethTo, setEthTo] = useState('0x0000000000000000000000000000000000000000')
  const [ethValue, setEthValue] = useState('0.01')
  const [ethGas, setEthGas] = useState('21000')
  const [ethGasPrice, setEthGasPrice] = useState('20')
  const [ethNonce, setEthNonce] = useState('0')
  const [ethChainId, setEthChainId] = useState('1')

  // SOL fields
  const [solPrivKey, setSolPrivKey] = useState('')
  const [solRecipient, setSolRecipient] = useState('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')
  const [solLamports, setSolLamports] = useState('1000000')

  const sign = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      if (chain === 'eth') {
        const data = await signEthTransaction({
          private_key: ethPrivKey,
          to: ethTo,
          value_eth: parseFloat(ethValue),
          gas_limit: parseInt(ethGas),
          gas_price_gwei: parseFloat(ethGasPrice),
          nonce: parseInt(ethNonce),
          chain_id: parseInt(ethChainId),
        })
        setResult(data)
      } else {
        const data = await signSolTransaction({
          private_key_hex: solPrivKey,
          recipient: solRecipient,
          lamports: parseInt(solLamports),
        })
        setResult(data)
      }
    } catch (e: any) {
      setError(e.message || 'Failed to sign. Check your private key and backend connection.')
    } finally {
      setLoading(false)
    }
  }

  const isEth = chain === 'eth'
  const accent = isEth ? 'text-eth-green' : 'text-sol-purple'
  const inputClass = `w-full bg-void-bg border rounded-lg px-3 py-2 font-mono text-sm text-void-text outline-none transition-colors ${
    isEth
      ? 'border-void-border focus:border-eth-green'
      : 'border-void-border focus:border-sol-purple'
  }`

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-white">Transaction Signer</h1>
        <p className="text-void-muted text-sm">
          Sign a simulated transaction and inspect the raw cryptographic signature.
        </p>
      </div>

      {/* Chain Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => { setChain('eth'); setResult(null) }}
          className={`px-4 py-2 rounded-lg font-mono text-sm border transition-all ${
            chain === 'eth'
              ? 'bg-eth-green/10 border-eth-green text-eth-green'
              : 'border-void-border text-void-muted'
          }`}
        >
          Ethereum (ECDSA)
        </button>
        <button
          onClick={() => { setChain('sol'); setResult(null) }}
          className={`px-4 py-2 rounded-lg font-mono text-sm border transition-all ${
            chain === 'sol'
              ? 'bg-sol-purple/10 border-sol-purple text-sol-purple'
              : 'border-void-border text-void-muted'
          }`}
        >
          Solana (Ed25519)
        </button>
      </div>

      {/* Form */}
      <div className="bg-void-surface border border-void-border rounded-xl p-6 space-y-4">
        <h2 className={`font-display text-lg font-bold ${accent}`}>Transaction Parameters</h2>

        {isEth ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-void-muted block mb-1">Private Key (0x...)</label>
              <input
                className={inputClass}
                value={ethPrivKey}
                onChange={(e) => setEthPrivKey(e.target.value)}
                placeholder="0x... (paste from Wallet Generator)"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-void-muted block mb-1">To Address</label>
                <input className={inputClass} value={ethTo} onChange={(e) => setEthTo(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-void-muted block mb-1">Value (ETH)</label>
                <input className={inputClass} value={ethValue} onChange={(e) => setEthValue(e.target.value)} type="number" step="0.001" />
              </div>
              <div>
                <label className="text-xs text-void-muted block mb-1">Gas Limit</label>
                <input className={inputClass} value={ethGas} onChange={(e) => setEthGas(e.target.value)} type="number" />
              </div>
              <div>
                <label className="text-xs text-void-muted block mb-1">Gas Price (Gwei)</label>
                <input className={inputClass} value={ethGasPrice} onChange={(e) => setEthGasPrice(e.target.value)} type="number" />
              </div>
              <div>
                <label className="text-xs text-void-muted block mb-1">Nonce</label>
                <input className={inputClass} value={ethNonce} onChange={(e) => setEthNonce(e.target.value)} type="number" />
              </div>
              <div>
                <label className="text-xs text-void-muted block mb-1">Chain ID (1=Mainnet)</label>
                <input className={inputClass} value={ethChainId} onChange={(e) => setEthChainId(e.target.value)} type="number" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-void-muted block mb-1">Private Key Hex (64 chars)</label>
              <input
                className={inputClass}
                value={solPrivKey}
                onChange={(e) => setSolPrivKey(e.target.value)}
                placeholder="64-char hex (paste from Wallet Generator)"
              />
            </div>
            <div>
              <label className="text-xs text-void-muted block mb-1">Recipient Address (Base58)</label>
              <input className={inputClass} value={solRecipient} onChange={(e) => setSolRecipient(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-void-muted block mb-1">Lamports (1 SOL = 1,000,000,000)</label>
              <input className={inputClass} value={solLamports} onChange={(e) => setSolLamports(e.target.value)} type="number" />
            </div>
          </div>
        )}

        <button
          onClick={sign}
          disabled={loading || (isEth ? !ethPrivKey : !solPrivKey)}
          className={`px-6 py-3 rounded-lg font-mono text-sm border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            isEth
              ? 'bg-eth-green/10 border-eth-green/40 text-eth-green hover:bg-eth-green/20'
              : 'bg-sol-purple/10 border-sol-purple/40 text-sol-purple hover:bg-sol-purple/20'
          }`}
        >
          {loading ? '⚡ Signing...' : `⚡ Sign ${isEth ? 'Ethereum' : 'Solana'} Transaction`}
        </button>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-lg p-4 text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="bg-void-surface border border-void-border rounded-xl p-6 space-y-4">
            <h2 className={`font-display text-xl font-bold ${accent}`}>Signature Output</h2>

            {isEth ? (
              <>
                <HashDisplay label="Transaction Hash" value={result.transaction_hash} copiable />
                <HashDisplay label="Raw Transaction (RLP encoded)" value={result.raw_transaction} copiable />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <HashDisplay label="r (ECDSA component)" value={result.signature?.r || ''} copiable />
                  <HashDisplay label="s (ECDSA component)" value={result.signature?.s || ''} copiable />
                  <div className="bg-void-bg border border-void-border rounded-lg p-3 space-y-1">
                    <div className="text-xs text-void-muted">v (recovery + EIP-155)</div>
                    <div className="text-eth-green font-mono text-sm">{result.signature?.v}</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <HashDisplay label="Signature (Hex, 64 bytes)" value={result.signature_hex} copiable />
                <HashDisplay label="Signature (Base58)" value={result.signature_base58} copiable />
                <HashDisplay label="Message Signed" value={result.message_text} />
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <span className="text-sol-purple">✓</span>
                  <span className="text-void-text text-xs">Ed25519 is deterministic — same input always produces same 64-byte signature</span>
                  <span
                    className={`ml-auto text-xs px-2 py-1 rounded border ${
                      result.signature_verified
                        ? 'border-green-600/40 text-green-400'
                        : 'border-red-600/40 text-red-400'
                    }`}
                  >
                    {result.signature_verified ? 'VERIFIED ✓' : 'INVALID ✗'}
                  </span>
                </div>
              </>
            )}
          </div>

          {result.steps && <StepVisualizer steps={result.steps} chain={chain} />}

          {/* Explainer */}
          <div className="bg-void-surface border border-void-border rounded-xl p-6 space-y-3">
            <h3 className="font-display font-bold text-white">
              Why is Ed25519 deterministic but ECDSA isn&apos;t?
            </h3>
            <div className="text-sm text-void-text space-y-2">
              <p>
                <span className="text-eth-green font-bold">ECDSA</span> requires a random secret
                nonce k per signature. If k is ever reused or leaked, the private key can be
                recovered algebraically. This happened with the PlayStation 3 hack (2010) — Sony
                used the same k for every signature.
              </p>
              <p>
                <span className="text-sol-purple font-bold">Ed25519</span> (RFC 8032) derives its
                nonce deterministically: nonce = SHA-512(private_key_nonce_half ‖ message). No
                external randomness required. Same message + same key → same signature always.
                This eliminates the k-reuse attack surface entirely.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
