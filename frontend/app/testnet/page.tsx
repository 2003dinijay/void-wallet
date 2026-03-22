'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  getSepoliaBalance,
  getGasPrice,
  broadcastRawTx,
  getTxStatus,
  getCounterValue,
  incrementCounter,
  resetCounter,
} from '@/lib/api'

// ── helpers ───────────────────────────────────────────────────────────────────
function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-eth-green hover:underline break-all font-mono text-xs"
    >
      {children}
    </a>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-void-surface border border-void-border rounded-xl p-6 space-y-4">
      <h2 className="font-display text-lg font-bold text-white">{title}</h2>
      {children}
    </div>
  )
}

function MonoRow({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2 items-baseline">
      <span className="text-void-muted text-xs font-mono w-40 shrink-0">{label}</span>
      <span className={`font-mono text-sm break-all ${accent ? 'text-eth-green' : 'text-void-text'}`}>{value}</span>
    </div>
  )
}

// ── Balance checker ───────────────────────────────────────────────────────────
function BalanceChecker() {
  const [addr, setAddr] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const check = async () => {
    if (!addr.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await getSepoliaBalance(addr.trim())
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section title="Balance Checker">
      <p className="text-void-muted text-xs font-mono">
        Look up any Ethereum address on Sepolia testnet.
      </p>
      <div className="flex gap-2 flex-wrap">
        <input
          value={addr}
          onChange={e => setAddr(e.target.value)}
          placeholder="0x... Ethereum address"
          className="flex-1 min-w-[260px] bg-void-bg border border-void-border focus:border-eth-green rounded-lg px-3 py-2 font-mono text-sm text-void-text outline-none transition-colors"
        />
        <button
          onClick={check}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-eth-green/10 border border-eth-green/40 text-eth-green font-mono text-sm hover:bg-eth-green/20 transition-all disabled:opacity-40"
        >
          {loading ? 'Checking…' : 'Check'}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
      {result && (
        <div className="space-y-2 pt-2 border-t border-void-border">
          <MonoRow label="Address" value={result.address} />
          <MonoRow label="Balance (ETH)" value={`${result.balance_eth} ETH`} accent />
          <MonoRow label="Balance (Wei)" value={result.balance_wei.toString()} />
          <MonoRow label="Network" value={result.network} />
          <div className="pt-1">
            <ExternalLink href={result.etherscan_url}>View on Sepolia Etherscan ↗</ExternalLink>
          </div>
          {result.balance_eth === 0 && (
            <p className="text-yellow-500 text-xs font-mono pt-1">
              No Sepolia ETH — get some free from{' '}
              <ExternalLink href="https://sepoliafaucet.com">sepoliafaucet.com</ExternalLink>
            </p>
          )}
        </div>
      )}
    </Section>
  )
}

// ── Gas price ─────────────────────────────────────────────────────────────────
function GasPanel() {
  const [gas, setGas] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      setGas(await getGasPrice())
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  return (
    <Section title="Live Gas Price">
      <p className="text-void-muted text-xs font-mono">Current Sepolia network gas price.</p>
      {gas && (
        <div className="space-y-2">
          <MonoRow label="Gas price (Gwei)" value={`${gas.gas_price_gwei} Gwei`} accent />
          <MonoRow label="Gas price (Wei)" value={gas.gas_price_wei.toString()} />
        </div>
      )}
      <button
        onClick={refresh}
        disabled={loading}
        className="px-3 py-1.5 rounded border border-void-border text-void-muted hover:text-white hover:border-eth-green/40 font-mono text-xs transition-all disabled:opacity-40"
      >
        {loading ? 'Refreshing…' : '↺ Refresh'}
      </button>
    </Section>
  )
}

// ── Raw tx broadcaster ────────────────────────────────────────────────────────
function TxBroadcaster() {
  const [rawTx, setRawTx] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const broadcast = async () => {
    if (!rawTx.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      setResult(await broadcastRawTx(rawTx.trim()))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section title="Broadcast Raw Transaction">
      <p className="text-void-muted text-xs font-mono">
        Paste a signed raw transaction hex (from the Sign page) and send it to Sepolia.
      </p>
      <textarea
        value={rawTx}
        onChange={e => setRawTx(e.target.value)}
        placeholder="0xf86c... (raw signed transaction hex)"
        rows={3}
        className="w-full bg-void-bg border border-void-border focus:border-eth-green rounded-lg px-3 py-2 font-mono text-xs text-void-text outline-none transition-colors resize-none"
      />
      <button
        onClick={broadcast}
        disabled={loading || !rawTx.trim()}
        className="px-4 py-2 rounded-lg bg-eth-green/10 border border-eth-green/40 text-eth-green font-mono text-sm hover:bg-eth-green/20 transition-all disabled:opacity-40"
      >
        {loading ? 'Broadcasting…' : '⚡ Broadcast to Sepolia'}
      </button>
      {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
      {result && (
        <div className="space-y-2 pt-2 border-t border-void-border">
          <MonoRow label="Tx Hash" value={result.tx_hash} />
          <MonoRow label="Status" value={result.status} accent />
          <ExternalLink href={result.etherscan_url}>Track on Sepolia Etherscan ↗</ExternalLink>
        </div>
      )}
    </Section>
  )
}

// ── Tx status checker ─────────────────────────────────────────────────────────
function TxStatusChecker() {
  const [txHash, setTxHash] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const check = async () => {
    if (!txHash.trim()) return
    setLoading(true)
    setError('')
    try {
      setResult(await getTxStatus(txHash.trim()))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const statusColor = result?.status === 'success'
    ? 'text-green-400'
    : result?.status === 'failed'
      ? 'text-red-400'
      : 'text-yellow-400'

  return (
    <Section title="Transaction Status">
      <p className="text-void-muted text-xs font-mono">Check whether a Sepolia transaction has been mined.</p>
      <div className="flex gap-2 flex-wrap">
        <input
          value={txHash}
          onChange={e => setTxHash(e.target.value)}
          placeholder="0x... transaction hash"
          className="flex-1 min-w-[260px] bg-void-bg border border-void-border focus:border-eth-green rounded-lg px-3 py-2 font-mono text-sm text-void-text outline-none transition-colors"
        />
        <button
          onClick={check}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-eth-green/10 border border-eth-green/40 text-eth-green font-mono text-sm hover:bg-eth-green/20 transition-all disabled:opacity-40"
        >
          {loading ? 'Checking…' : 'Check'}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
      {result && (
        <div className="space-y-2 pt-2 border-t border-void-border">
          <div className="flex flex-wrap gap-2 items-baseline">
            <span className="text-void-muted text-xs font-mono w-40 shrink-0">Status</span>
            <span className={`font-mono text-sm font-bold ${statusColor}`}>{result.status.toUpperCase()}</span>
          </div>
          {result.block_number && <MonoRow label="Block" value={result.block_number} />}
          {result.gas_used && <MonoRow label="Gas used" value={result.gas_used} />}
          {result.etherscan_url && (
            <ExternalLink href={result.etherscan_url}>View on Sepolia Etherscan ↗</ExternalLink>
          )}
        </div>
      )}
    </Section>
  )
}

// ── Counter contract ──────────────────────────────────────────────────────────
function CounterPanel() {
  const [counterData, setCounterData] = useState<any>(null)
  const [privateKey, setPrivateKey] = useState('')
  const [txResult, setTxResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadingReset, setLoadingReset] = useState(false)
  const [loadingCount, setLoadingCount] = useState(false)
  const [error, setError] = useState('')
  const [notDeployed, setNotDeployed] = useState(false)

  const fetchCount = useCallback(async () => {
    setLoadingCount(true)
    setError('')
    setNotDeployed(false)
    try {
      setCounterData(await getCounterValue())
    } catch (e: any) {
      if (e.message.includes('COUNTER_CONTRACT_ADDRESS')) {
        setNotDeployed(true)
      } else {
        setError(e.message)
      }
    } finally {
      setLoadingCount(false)
    }
  }, [])

  useEffect(() => { fetchCount() }, [fetchCount])

  const handleIncrement = async () => {
    if (!privateKey.trim()) { setError('Enter your private key to sign the transaction.'); return }
    setLoading(true)
    setError('')
    setTxResult(null)
    try {
      const res = await incrementCounter(privateKey.trim())
      setTxResult(res)
      // Refresh count after ~4s (one block time)
      setTimeout(fetchCount, 4000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!privateKey.trim()) { setError('Enter your private key to sign the transaction.'); return }
    setLoadingReset(true)
    setError('')
    setTxResult(null)
    try {
      const res = await resetCounter(privateKey.trim())
      setTxResult(res)
      setTimeout(fetchCount, 4000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoadingReset(false)
    }
  }

  return (
    <Section title="Counter Smart Contract">
      <p className="text-void-muted text-xs font-mono">
        A Solidity contract deployed on Sepolia. Anyone can increment. Only the deployer can reset.
      </p>

      {notDeployed ? (
        <div className="bg-yellow-950/30 border border-yellow-800/40 rounded-lg p-4 space-y-2">
          <p className="text-yellow-400 text-sm font-mono font-bold">Contract not yet deployed</p>
          <p className="text-yellow-500 text-xs font-mono">
            Run <code className="bg-void-bg px-1 rounded">python deploy_counter.py</code> in the backend folder,
            then add <code className="bg-void-bg px-1 rounded">COUNTER_CONTRACT_ADDRESS=0x...</code> to your .env and restart the server.
          </p>
          <p className="text-yellow-500 text-xs font-mono">
            You need Sepolia ETH to deploy. Get some free from{' '}
            <ExternalLink href="https://sepoliafaucet.com">sepoliafaucet.com</ExternalLink>
          </p>
        </div>
      ) : (
        <>
          {/* Current count display */}
          <div className="bg-void-bg border border-void-border rounded-xl p-6 text-center space-y-1">
            <p className="text-void-muted text-xs font-mono uppercase tracking-widest">Current Count</p>
            <p className="font-display text-7xl font-bold text-eth-green tabular-nums">
              {loadingCount ? '…' : (counterData?.count ?? '?')}
            </p>
            <button
              onClick={fetchCount}
              disabled={loadingCount}
              className="text-void-muted hover:text-eth-green font-mono text-xs transition-colors mt-2"
            >
              {loadingCount ? 'loading…' : '↺ refresh'}
            </button>
          </div>

          {counterData && (
            <div className="space-y-1 text-xs">
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-void-muted font-mono">Contract:</span>
                <ExternalLink href={counterData.etherscan_url}>{counterData.contract_address}</ExternalLink>
              </div>
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-void-muted font-mono">Owner:</span>
                <span className="text-void-text font-mono">{counterData.owner}</span>
              </div>
            </div>
          )}

          {/* Private key input */}
          <div className="pt-2 border-t border-void-border space-y-3">
            <p className="text-void-muted text-xs font-mono">
              To increment, sign a transaction with your private key. The key is sent to your local backend only — never stored.
            </p>
            <div className="flex gap-2 flex-wrap">
              <input
                value={privateKey}
                onChange={e => setPrivateKey(e.target.value)}
                placeholder="Private key (0x...)"
                type="password"
                className="flex-1 min-w-[220px] bg-void-bg border border-void-border focus:border-eth-green rounded-lg px-3 py-2 font-mono text-sm text-void-text outline-none transition-colors"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleIncrement}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-eth-green/10 border border-eth-green/40 text-eth-green font-mono text-sm hover:bg-eth-green/20 transition-all disabled:opacity-40"
              >
                {loading ? 'Signing & Broadcasting…' : '⬆ Increment Counter'}
              </button>
              <button
                onClick={handleReset}
                disabled={loadingReset}
                className="px-4 py-2.5 rounded-lg bg-red-950/30 border border-red-800/40 text-red-400 font-mono text-sm hover:bg-red-900/30 transition-all disabled:opacity-40"
              >
                {loadingReset ? 'Resetting…' : 'Reset (owner only)'}
              </button>
            </div>
          </div>
        </>
      )}

      {error && <p className="text-red-400 text-xs font-mono">{error}</p>}

      {txResult && (
        <div className="bg-green-950/20 border border-green-800/30 rounded-lg p-4 space-y-2">
          <p className="text-green-400 text-sm font-mono font-bold">✓ Transaction broadcast to Sepolia</p>
          <MonoRow label="Tx Hash" value={txResult.tx_hash} />
          <MonoRow label="From" value={txResult.from_address} />
          <MonoRow label="Nonce" value={txResult.nonce} />
          <MonoRow label="Gas price" value={`${txResult.gas_price_gwei} Gwei`} />
          <ExternalLink href={txResult.etherscan_url}>Track on Sepolia Etherscan ↗</ExternalLink>
          <p className="text-void-muted text-xs font-mono">Counter will refresh automatically in ~4 seconds.</p>
        </div>
      )}
    </Section>
  )
}

// ── How it works explainer ────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <Section title="How This Works">
      <div className="space-y-3 text-sm text-void-text">
        <p>
          This page connects to <span className="text-eth-green font-mono">Ethereum Sepolia testnet</span> — a real blockchain that uses play-money ETH.
          Everything here is a real on-chain interaction, just without real value.
        </p>
        <div className="space-y-1">
          <p className="text-white font-semibold">Transaction flow for incrementing the counter:</p>
          <ol className="list-decimal list-inside space-y-1 text-void-muted text-xs font-mono">
            <li>Your private key is used to sign a call to <code>increment()</code></li>
            <li>The signed raw transaction hex is sent to Alchemy&apos;s Sepolia RPC</li>
            <li>Alchemy forwards it to the Sepolia validator network</li>
            <li>A validator mines it into a block (~12 seconds)</li>
            <li>The contract&apos;s <code>count</code> storage slot is updated by 1</li>
          </ol>
        </div>
        <div className="bg-yellow-950/20 border border-yellow-800/30 rounded-lg p-3">
          <p className="text-yellow-400 text-xs font-mono">
            You need Sepolia ETH to pay gas (~0.001 ETH per tx). Get it free from:
          </p>
          <div className="flex gap-3 mt-1">
            <ExternalLink href="https://sepoliafaucet.com">sepoliafaucet.com</ExternalLink>
            <ExternalLink href="https://faucet.quicknode.com/ethereum/sepolia">QuickNode Faucet</ExternalLink>
          </div>
        </div>
      </div>
    </Section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TestnetPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-bold text-white">Sepolia Testnet</h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-eth-green/10 border border-eth-green/30 text-eth-green">LIVE</span>
        </div>
        <p className="text-void-muted text-sm">
          Real Ethereum blockchain interactions on the Sepolia testnet via Alchemy RPC.
          Generate a wallet on the <a href="/wallet" className="text-eth-green hover:underline">Wallet page</a>, fund it from a faucet, then come back here.
        </p>
      </div>

      <CounterPanel />
      <BalanceChecker />
      <GasPanel />
      <TxBroadcaster />
      <TxStatusChecker />
      <HowItWorks />
    </div>
  )
}
