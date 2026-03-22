'use client'

interface EthValues {
  privKey: string
  to: string
  value: string
  gas: string
  gasPrice: string
  nonce: string
  chainId: string
}

interface EthFormProps {
  values: EthValues
  onChange: (field: keyof EthValues, val: string) => void
}

export function EthTransactionForm({ values, onChange }: EthFormProps) {
  const inputClass =
    'w-full bg-void-bg border border-void-border focus:border-eth-green rounded-lg px-3 py-2 font-mono text-sm text-void-text outline-none transition-colors'

  const fields: Array<{ label: string; field: keyof EthValues; placeholder?: string; type?: string }> = [
    { label: 'To Address', field: 'to', placeholder: '0x...' },
    { label: 'Value (ETH)', field: 'value', placeholder: '0.01', type: 'number' },
    { label: 'Gas Limit', field: 'gas', placeholder: '21000', type: 'number' },
    { label: 'Gas Price (Gwei)', field: 'gasPrice', placeholder: '20', type: 'number' },
    { label: 'Nonce', field: 'nonce', placeholder: '0', type: 'number' },
    { label: 'Chain ID', field: 'chainId', placeholder: '1', type: 'number' },
  ]

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-void-muted block mb-1">Private Key (0x...)</label>
        <input
          className={inputClass}
          value={values.privKey}
          onChange={(e) => onChange('privKey', e.target.value)}
          placeholder="0x..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ label, field, placeholder, type }) => (
          <div key={field}>
            <label className="text-xs text-void-muted block mb-1">{label}</label>
            <input
              className={inputClass}
              value={values[field]}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder={placeholder}
              type={type}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

interface SolValues {
  privKey: string
  recipient: string
  lamports: string
}

interface SolFormProps {
  values: SolValues
  onChange: (field: keyof SolValues, val: string) => void
}

export function SolTransactionForm({ values, onChange }: SolFormProps) {
  const inputClass =
    'w-full bg-void-bg border border-void-border focus:border-sol-purple rounded-lg px-3 py-2 font-mono text-sm text-void-text outline-none transition-colors'

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-void-muted block mb-1">Private Key Hex</label>
        <input
          className={inputClass}
          value={values.privKey}
          onChange={(e) => onChange('privKey', e.target.value)}
          placeholder="64-char hex"
        />
      </div>
      <div>
        <label className="text-xs text-void-muted block mb-1">Recipient (Base58)</label>
        <input
          className={inputClass}
          value={values.recipient}
          onChange={(e) => onChange('recipient', e.target.value)}
          placeholder="7xKX..."
        />
      </div>
      <div>
        <label className="text-xs text-void-muted block mb-1">
          Lamports (1 SOL = 1,000,000,000)
        </label>
        <input
          className={inputClass}
          value={values.lamports}
          onChange={(e) => onChange('lamports', e.target.value)}
          type="number"
        />
      </div>
    </div>
  )
}
