'use client'
import Link from 'next/link'

interface Props {
  chain: 'eth' | 'sol'
  title: string
  algorithm: string
  features: string[]
}

export default function WalletCard({ chain, title, algorithm, features }: Props) {
  const isEth = chain === 'eth'
  const accent = isEth ? 'text-eth-green' : 'text-sol-purple'
  const border = isEth ? 'hover:border-eth-green/40' : 'hover:border-sol-purple/40'
  const btnBg = isEth
    ? 'bg-eth-green/10 hover:bg-eth-green/20 border-eth-green/40 text-eth-green'
    : 'bg-sol-purple/10 hover:bg-sol-purple/20 border-sol-purple/40 text-sol-purple'
  const badgeBg = isEth
    ? 'bg-eth-green/10 border-eth-green/30 text-eth-green'
    : 'bg-sol-purple/10 border-sol-purple/30 text-sol-purple'

  return (
    <div
      className={`bg-void-surface border border-void-border rounded-xl p-6 space-y-4 ${border} transition-all duration-300`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold font-mono text-sm ${badgeBg}`}
        >
          {chain.toUpperCase()}
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white">{title}</h2>
          <p className={`text-xs ${accent}`}>{algorithm}</p>
        </div>
      </div>

      <ul className="space-y-1.5 text-xs text-void-text">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className={`${accent} mt-0.5 shrink-0`}>→</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/wallet?chain=${chain}`}
        className={`block text-center py-2.5 rounded-lg font-mono text-sm border transition-all ${btnBg}`}
      >
        Generate {isEth ? 'Ethereum' : 'Solana'} Wallet
      </Link>
    </div>
  )
}
