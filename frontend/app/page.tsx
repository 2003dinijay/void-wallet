'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center space-y-6 pt-8">
        <div className="text-xs font-mono text-void-muted tracking-widest uppercase">
          Blockchain Cryptography — Live Demo
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight">
          Cryptographic<br />
          <span className="text-eth-green">Primitives</span> Visualized
        </h1>
        <p className="text-void-text max-w-2xl mx-auto text-sm leading-relaxed">
          Generate real Ethereum and Solana wallets from entropy to address.
          Sign transactions. Watch every cryptographic operation — ECDSA, Ed25519,
          Keccak-256, BIP-39, BIP-32 — execute step by step.
        </p>
      </section>

      {/* Wallet Cards */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Ethereum Card */}
        <div className="bg-void-surface border border-void-border rounded-xl p-6 space-y-5 hover:border-eth-green/40 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-eth-green/10 border border-eth-green/30 flex items-center justify-center text-eth-green font-bold font-mono text-sm">
              ETH
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Ethereum Wallet</h2>
              <p className="text-xs text-void-muted">ECDSA + secp256k1</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-void-text">
            {[
              'secp256k1 elliptic curve (y² = x³ + 7)',
              'ECDSA — probabilistic, requires random k',
              'Keccak-256 address derivation',
              'EIP-55 checksum + EIP-155 replay protection',
              "BIP-39 mnemonic → BIP-32 HD derivation m/44'/60'/0'/0/0",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-eth-green mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/wallet?chain=eth"
            className="block w-full text-center bg-eth-green/10 hover:bg-eth-green/20 border border-eth-green/40 text-eth-green font-mono text-sm rounded-lg py-3 transition-all duration-200"
          >
            Generate Ethereum Wallet
          </Link>
        </div>

        {/* Solana Card */}
        <div className="bg-void-surface border border-void-border rounded-xl p-6 space-y-5 hover:border-sol-purple/40 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sol-purple/10 border border-sol-purple/30 flex items-center justify-center text-sol-purple font-bold font-mono text-sm">
              SOL
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Solana Wallet</h2>
              <p className="text-xs text-void-muted">Ed25519 + Curve25519</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-void-text">
            {[
              'Twisted Edwards curve (Curve25519)',
              'Ed25519 — fully deterministic signatures',
              'No hashing for address — raw pubkey in Base58',
              'Same input always produces same signature',
              "BIP-39 mnemonic → m/44'/501'/0'/0'",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-sol-purple mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/wallet?chain=sol"
            className="block w-full text-center bg-sol-purple/10 hover:bg-sol-purple/20 border border-sol-purple/40 text-sol-purple font-mono text-sm rounded-lg py-3 transition-all duration-200"
          >
            Generate Solana Wallet
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-4 text-sm">
        {[
          {
            icon: '🔑',
            title: 'Key Generation',
            desc: 'Watch entropy → mnemonic → seed → private key → public key → address in real time',
          },
          {
            icon: '✍️',
            title: 'Transaction Signing',
            desc: 'Sign simulated transactions and see the raw ECDSA or Ed25519 signature bytes',
          },
          {
            icon: '📊',
            title: 'Crypto Comparison',
            desc: 'Interactive ECDSA vs Ed25519 vs BLS comparison + ZKP Groth16 explainer',
          },
        ].map((f) => (
          <div key={f.title} className="bg-void-surface border border-void-border rounded-lg p-4 space-y-2">
            <div className="text-2xl">{f.icon}</div>
            <h3 className="font-display font-bold text-white">{f.title}</h3>
            <p className="text-void-muted text-xs">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Quick nav */}
      <section className="flex flex-wrap gap-3 justify-center">
        <Link href="/wallet" className="px-4 py-2 border border-void-border rounded-lg text-void-muted hover:text-white hover:border-eth-green/40 text-xs font-mono transition-all">
          → Wallet Generator
        </Link>
        <Link href="/sign" className="px-4 py-2 border border-void-border rounded-lg text-void-muted hover:text-white hover:border-eth-green/40 text-xs font-mono transition-all">
          → Transaction Signer
        </Link>
        <Link href="/visualize" className="px-4 py-2 border border-void-border rounded-lg text-void-muted hover:text-white hover:border-sol-purple/40 text-xs font-mono transition-all">
          → Crypto Visualizer
        </Link>
      </section>
    </div>
  )
}
