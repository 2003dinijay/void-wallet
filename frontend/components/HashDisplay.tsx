'use client'
import { useState } from 'react'

interface Props {
  label: string
  value: string
  blurred?: boolean
  copiable?: boolean
  warning?: boolean
  accent?: 'eth' | 'sol'
}

export default function HashDisplay({
  label,
  value,
  blurred = false,
  copiable = false,
  warning = false,
  accent,
}: Props) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const accentColor =
    accent === 'eth'
      ? 'text-eth-green'
      : accent === 'sol'
      ? 'text-sol-purple'
      : 'text-void-text'

  const borderColor =
    accent === 'eth'
      ? 'border-eth-green/20'
      : accent === 'sol'
      ? 'border-sol-purple/20'
      : 'border-void-border'

  return (
    <div className={`bg-void-bg border ${borderColor} rounded-lg p-3 space-y-1`}>
      <div className="flex items-center justify-between">
        <label className="text-xs text-void-muted">
          {label}
          {warning && <span className="text-yellow-500 ml-2">⚠️ sensitive</span>}
        </label>
        <div className="flex gap-3">
          {blurred && (
            <button
              onClick={() => setRevealed(!revealed)}
              className="text-xs text-void-muted hover:text-void-text transition-colors"
            >
              {revealed ? 'hide' : 'reveal'}
            </button>
          )}
          {copiable && (
            <button
              onClick={copy}
              className="text-xs text-void-muted hover:text-void-text transition-colors"
            >
              {copied ? '✓ copied' : 'copy'}
            </button>
          )}
        </div>
      </div>

      <div className={`relative font-mono text-xs break-all hash-text ${accentColor}`}>
        {blurred && !revealed ? (
          <>
            <div className="blur-sm select-none">{value}</div>
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={() => setRevealed(true)}
            >
              <span className="bg-void-surface border border-void-border rounded px-2 py-0.5 text-xs text-void-muted hover:text-void-text">
                Click to reveal
              </span>
            </div>
          </>
        ) : (
          <div>{value}</div>
        )}
      </div>
    </div>
  )
}
