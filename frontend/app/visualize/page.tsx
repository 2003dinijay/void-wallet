'use client'
import { useState, useEffect, useRef } from 'react'
import { getCryptoCompare } from '@/lib/api'

async function sha256Demo(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function VisualizePage() {
  const [compareData, setCompareData] = useState<any>(null)
  const [hashInput, setHashInput] = useState('')
  const [hashOutput, setHashOutput] = useState('')
  const [activeAlgo, setActiveAlgo] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getCryptoCompare().then(setCompareData).catch(console.error)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (hashInput) {
        const h = await sha256Demo(hashInput)
        setHashOutput(h)
      } else {
        setHashOutput('')
      }
    }, 150)
  }, [hashInput])

  const algoColors = [
    { text: 'text-eth-green', bg: 'bg-eth-green/10', border: 'border-eth-green', muted: 'border-eth-green/20' },
    { text: 'text-sol-purple', bg: 'bg-sol-purple/10', border: 'border-sol-purple', muted: 'border-sol-purple/20' },
    { text: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-500', muted: 'border-blue-400/20' },
  ]

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-white">Cryptography Visualizer</h1>
        <p className="text-void-muted text-sm">
          Interactive comparison of signature algorithms + key derivation pipeline + live hash demo.
        </p>
      </div>

      {/* Algorithm Comparison */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-white">Signature Algorithm Comparison</h2>
        {compareData?.algorithms ? (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {compareData.algorithms.map((algo: any, i: number) => {
                const c = algoColors[i]
                return (
                  <button
                    key={algo.name}
                    onClick={() => setActiveAlgo(i)}
                    className={`px-3 py-1.5 rounded font-mono text-xs border transition-all ${
                      activeAlgo === i
                        ? `${c.bg} ${c.border} ${c.text}`
                        : 'border-void-border text-void-muted hover:border-void-text'
                    }`}
                  >
                    {algo.name}
                  </button>
                )
              })}
            </div>

            {/* Detail card */}
            {(() => {
              const algo = compareData.algorithms[activeAlgo]
              const c = algoColors[activeAlgo]
              return (
                <div className="bg-void-surface border border-void-border rounded-xl p-6 grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className={`font-display text-xl font-bold ${c.text}`}>{algo.name}</h3>
                    <div className="space-y-1.5 text-sm">
                      {[
                        ['Used by', algo.used_by],
                        ['Curve', algo.curve],
                        ['Key size', `${algo.key_size_bits} bits`],
                        ['Sig size', `${algo.signature_size_bytes} bytes`],
                        ['Hash fn', algo.hash_function],
                      ].map(([label, value]) => (
                        <div key={label} className="flex gap-2">
                          <span className="text-void-muted w-24 shrink-0 text-xs">{label}:</span>
                          <span className="text-void-text text-xs font-mono">{value}</span>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <span className="text-void-muted w-24 shrink-0 text-xs">Deterministic:</span>
                        <span className={`text-xs ${algo.deterministic ? 'text-green-400' : 'text-red-400'}`}>
                          {algo.deterministic ? 'Yes ✓' : 'No ✗ (random k required)'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-green-400 mb-1 font-mono">+ Pros</div>
                      <ul className="space-y-1">
                        {algo.pros.map((p: string) => (
                          <li key={p} className="text-xs text-void-text flex gap-2">
                            <span className="text-green-400 shrink-0">+</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs text-red-400 mb-1 font-mono">− Cons</div>
                      <ul className="space-y-1">
                        {algo.cons.map((c: string) => (
                          <li key={c} className="text-xs text-void-text flex gap-2">
                            <span className="text-red-400 shrink-0">−</span>{c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        ) : (
          <div className="text-void-muted text-sm font-mono">
            Loading comparison data... (requires backend on port 8000)
          </div>
        )}
      </section>

      {/* Key Derivation Pipeline */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-white">
          BIP-39 → BIP-32 → Address Pipeline
        </h2>
        <div className="overflow-x-auto">
          <div className="flex gap-2 items-center min-w-max pb-2">
            {[
              { label: 'Entropy', detail: '128 bits\nos.urandom()', color: 'border-yellow-600/40 text-yellow-400' },
              null,
              { label: 'BIP-39\nMnemonic', detail: '12 words\nSHA-256 checksum', color: 'border-orange-600/40 text-orange-400' },
              null,
              { label: 'PBKDF2\nSHA-512', detail: '512-bit seed\n2048 rounds', color: 'border-red-600/40 text-red-400' },
              null,
              { label: 'BIP-32\nDerivation', detail: 'HMAC-SHA512\nchild keys', color: 'border-purple-600/40 text-purple-400' },
              null,
              { label: 'EC Multiply\n× G', detail: 'secp256k1 or\nCurve25519', color: 'border-blue-600/40 text-blue-400' },
              null,
              { label: 'Address', detail: 'Keccak-256 (ETH)\nBase58 (SOL)', color: 'border-green-600/40 text-green-400' },
            ].map((item, i) =>
              item === null ? (
                <span key={i} className="text-void-muted text-xl">→</span>
              ) : (
                <div key={i} className={`border rounded-lg px-3 py-2 text-center min-w-[90px] ${item.color}`}>
                  <div className="font-mono text-xs font-bold whitespace-pre-line">{item.label}</div>
                  <div className="text-void-muted text-xs mt-1 whitespace-pre-line">{item.detail}</div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Live Hash Demo */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-white">Live Hash Demo</h2>
        <p className="text-void-muted text-xs">
          Type anything — watch the SHA-256 digest update in real time (browser crypto.subtle).
          Notice the avalanche effect: one character change flips ~50% of output bits.
        </p>
        <div className="space-y-3">
          <input
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            placeholder="Type anything here..."
            className="w-full bg-void-bg border border-void-border focus:border-eth-green rounded-lg px-4 py-3 font-mono text-sm text-void-text outline-none transition-colors"
          />
          {hashOutput && (
            <div className="bg-void-surface border border-eth-green/20 rounded-lg p-4 space-y-1">
              <div className="text-xs text-void-muted">SHA-256({JSON.stringify(hashInput)})</div>
              <div className="font-mono text-eth-green text-sm hash-text break-all">{hashOutput}</div>
            </div>
          )}
        </div>
      </section>

      {/* ZKP Explainer */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-white">Zero-Knowledge Proofs (ZKP)</h2>
        {compareData?.zkp_explainer ? (
          <div className="bg-void-surface border border-void-border rounded-xl p-6 space-y-4">
            <p className="text-void-text text-sm italic">&ldquo;{compareData.zkp_explainer.concept}&rdquo;</p>
            <p className="text-xs text-void-muted">Used in: {compareData.zkp_explainer.blockchain_use}</p>

            <div className="space-y-3">
              <h3 className="font-display font-bold text-white text-sm">
                {compareData.zkp_explainer.groth16.name} — {compareData.zkp_explainer.groth16.type}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Proof size', value: compareData.zkp_explainer.groth16.proof_size },
                  { label: 'Verification', value: compareData.zkp_explainer.groth16.verification_time },
                  { label: 'Type', value: 'zk-SNARK' },
                ].map((item) => (
                  <div key={item.label} className="bg-void-bg border border-void-border rounded-lg p-3 text-center">
                    <div className="text-xs text-void-muted">{item.label}</div>
                    <div className="text-sol-purple font-mono text-xs mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                {compareData.zkp_explainer.groth16.steps.map((step: string, i: number) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <span className="text-sol-purple shrink-0 font-mono">{String(i + 1).padStart(2, '0')}.</span>
                    <span className="text-void-text">{step.replace(/^\d+\.\s/, '')}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-void-muted border-t border-void-border pt-3">
                Note: Groth16 requires a trusted setup ceremony. The randomness used (toxic waste) must be destroyed — if kept, anyone could forge proofs.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-void-muted text-sm font-mono">
            Loading ZKP data... (requires backend on port 8000)
          </div>
        )}
      </section>
    </div>
  )
}
