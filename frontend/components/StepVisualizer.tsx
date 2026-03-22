'use client'

interface Step {
  step: number
  name: string
  detail: string
  output: string
}

interface Props {
  steps: Step[]
  chain: 'eth' | 'sol'
}

export default function StepVisualizer({ steps, chain }: Props) {
  const isEth = chain === 'eth'
  const accent = isEth ? 'text-eth-green' : 'text-sol-purple'
  const borderAccent = isEth ? 'border-eth-green/30' : 'border-sol-purple/30'
  const bgAccent = isEth ? 'bg-eth-green/5' : 'bg-sol-purple/5'
  const badgeBg = isEth
    ? 'bg-eth-green/10 text-eth-green border-eth-green/30'
    : 'bg-sol-purple/10 text-sol-purple border-sol-purple/30'

  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div
          key={step.step}
          className={`step-card bg-void-surface border ${borderAccent} ${bgAccent} rounded-xl p-4 space-y-2`}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="flex items-center gap-3">
            <span className={`border rounded px-2 py-0.5 font-mono text-xs font-bold ${badgeBg}`}>
              {String(step.step).padStart(2, '0')}
            </span>
            <h3 className={`font-mono text-sm font-bold ${accent}`}>{step.name}</h3>
            <span className={`ml-auto ${accent} text-sm`}>✓</span>
          </div>

          <p className="text-void-muted text-xs leading-relaxed">{step.detail}</p>

          {step.output && (
            <div className="bg-void-bg rounded-lg p-2">
              <div className={`font-mono text-xs hash-text break-all ${accent} opacity-80`}>
                {step.output.length > 120 ? step.output.slice(0, 120) + '...' : step.output}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
