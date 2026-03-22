'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getMyWallets, deleteWallet, validateAddress, searchWallets } from '@/lib/api'
import { getUser, clearAuth, isLoggedIn } from '@/lib/auth'

export default function DashboardPage() {
  const router = useRouter()
  const user = getUser()
  const [wallets, setWallets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Validator state
  const [valChain, setValChain] = useState<'eth' | 'sol'>('eth')
  const [valAddress, setValAddress] = useState('')
  const [valResult, setValResult] = useState<any>(null)
  const [validating, setValidating] = useState(false)

  // Search state
  const [searchUsername, setSearchUsername] = useState('')
  const [searchChain, setSearchChain] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    loadWallets()
  }, [])

  const loadWallets = async () => {
    try {
      const data = await getMyWallets()
      setWallets(data)
    } catch { } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await deleteWallet(id)
      setWallets(w => w.filter(x => x.id !== id))
    } catch { } finally { setDeleting(null) }
  }

  const handleValidate = async () => {
    if (!valAddress.trim()) return
    setValidating(true)
    setValResult(null)
    try {
      const res = await validateAddress(valChain, valAddress.trim())
      setValResult(res)
    } catch (e: any) {
      setValResult({ valid: false, error: e.message })
    } finally { setValidating(false) }
  }

  const handleSearch = async () => {
    setSearching(true)
    try {
      const res = await searchWallets(searchUsername || undefined, searchChain || undefined)
      setSearchResults(res)
    } catch { } finally { setSearching(false) }
  }

  const handleLogout = () => { clearAuth(); router.push('/') }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-void-muted text-sm mt-1">
            Welcome back, <span className="text-eth-green font-mono">{user?.username}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/wallet" className="px-4 py-2 bg-eth-green/10 border border-eth-green/40 text-eth-green rounded-lg font-mono text-sm hover:bg-eth-green/20 transition-all">
            + New Wallet
          </Link>
          <button onClick={handleLogout} className="px-4 py-2 border border-void-border text-void-muted rounded-lg font-mono text-sm hover:border-red-800/40 hover:text-red-400 transition-all">
            Logout
          </button>
        </div>
      </div>

      {/* My Wallets */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-white">My Wallets</h2>
        {loading ? (
          <p className="text-void-muted text-sm font-mono">Loading...</p>
        ) : wallets.length === 0 ? (
          <div className="bg-void-surface border border-void-border rounded-xl p-8 text-center space-y-3">
            <p className="text-void-muted text-sm">No wallets saved yet.</p>
            <Link href="/wallet" className="inline-block px-4 py-2 bg-eth-green/10 border border-eth-green/40 text-eth-green rounded-lg font-mono text-sm hover:bg-eth-green/20 transition-all">
              Generate your first wallet
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {wallets.map(w => {
              const isEth = w.chain === 'eth'
              const accent = isEth ? 'text-eth-green border-eth-green/20' : 'text-sol-purple border-sol-purple/20'
              const badge = isEth ? 'bg-eth-green/10 text-eth-green border-eth-green/30' : 'bg-sol-purple/10 text-sol-purple border-sol-purple/30'
              return (
                <div key={w.id} className="bg-void-surface border border-void-border rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`border rounded px-2 py-0.5 font-mono text-xs font-bold ${badge}`}>
                      {w.chain.toUpperCase()}
                    </span>
                    <span className="font-mono text-sm text-white">{w.name}</span>
                    {w.is_public && (
                      <span className="text-xs text-void-muted border border-void-border rounded px-1.5 py-0.5">public</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-mono text-xs break-all ${accent.split(' ')[0]}`}>{w.address}</div>
                    <div className="text-void-muted text-xs mt-0.5">{w.derivation_path}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/wallet/${w.address}`}
                      className="px-3 py-1.5 border border-void-border text-void-muted rounded font-mono text-xs hover:text-white hover:border-void-text transition-all"
                    >
                      Share
                    </Link>
                    <button
                      onClick={() => handleDelete(w.id)}
                      disabled={deleting === w.id}
                      className="px-3 py-1.5 border border-red-900/40 text-red-500/60 rounded font-mono text-xs hover:border-red-600/40 hover:text-red-400 transition-all disabled:opacity-40"
                    >
                      {deleting === w.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Address Validator */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-white">Validate Address</h2>
        <div className="bg-void-surface border border-void-border rounded-xl p-5 space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => { setValChain('eth'); setValResult(null) }}
              className={`px-3 py-1.5 rounded font-mono text-xs border transition-all ${valChain === 'eth' ? 'bg-eth-green/10 border-eth-green text-eth-green' : 'border-void-border text-void-muted'}`}
            >ETH</button>
            <button
              onClick={() => { setValChain('sol'); setValResult(null) }}
              className={`px-3 py-1.5 rounded font-mono text-xs border transition-all ${valChain === 'sol' ? 'bg-sol-purple/10 border-sol-purple text-sol-purple' : 'border-void-border text-void-muted'}`}
            >SOL</button>
          </div>
          <div className="flex gap-3">
            <input
              value={valAddress}
              onChange={e => { setValAddress(e.target.value); setValResult(null) }}
              placeholder={valChain === 'eth' ? '0x...' : '7xKX...'}
              className="flex-1 bg-void-bg border border-void-border focus:border-eth-green rounded-lg px-3 py-2 font-mono text-sm text-void-text outline-none transition-colors"
            />
            <button
              onClick={handleValidate}
              disabled={validating || !valAddress.trim()}
              className="px-4 py-2 bg-eth-green/10 border border-eth-green/40 text-eth-green rounded-lg font-mono text-sm hover:bg-eth-green/20 transition-all disabled:opacity-40"
            >
              {validating ? '...' : 'Validate'}
            </button>
          </div>

          {valResult && (
            <div className={`rounded-lg p-4 border font-mono text-sm space-y-2 ${valResult.valid ? 'bg-green-950/30 border-green-700/30' : 'bg-red-950/30 border-red-700/30'}`}>
              <div className={`font-bold ${valResult.valid ? 'text-green-400' : 'text-red-400'}`}>
                {valResult.valid ? '✓ Valid address' : '✗ Invalid address'}
              </div>
              {valResult.error && <div className="text-xs text-void-muted">{valResult.error}</div>}
              {valResult.checksummed && (
                <div className="text-xs">
                  <span className="text-void-muted">Checksummed: </span>
                  <span className="text-eth-green break-all">{valResult.checksummed}</span>
                </div>
              )}
              {valResult.checksum_ok === false && (
                <div className="text-yellow-400 text-xs">⚠ Checksum mismatch — use the corrected address above</div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Search Public Wallets */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-white">Search Public Wallets</h2>
        <div className="bg-void-surface border border-void-border rounded-xl p-5 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <input
              value={searchUsername}
              onChange={e => setSearchUsername(e.target.value)}
              placeholder="Username..."
              className="flex-1 min-w-[150px] bg-void-bg border border-void-border focus:border-sol-purple rounded-lg px-3 py-2 font-mono text-sm text-void-text outline-none transition-colors"
            />
            <select
              value={searchChain}
              onChange={e => setSearchChain(e.target.value)}
              className="bg-void-bg border border-void-border rounded-lg px-3 py-2 font-mono text-sm text-void-text outline-none"
            >
              <option value="">All chains</option>
              <option value="eth">Ethereum</option>
              <option value="sol">Solana</option>
            </select>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 bg-sol-purple/10 border border-sol-purple/40 text-sol-purple rounded-lg font-mono text-sm hover:bg-sol-purple/20 transition-all disabled:opacity-40"
            >
              {searching ? '...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map(w => (
                <Link
                  key={w.id}
                  href={`/wallet/${w.address}`}
                  className="flex items-center gap-4 bg-void-bg border border-void-border rounded-lg p-3 hover:border-sol-purple/30 transition-all"
                >
                  <span className={`font-mono text-xs font-bold border rounded px-2 py-0.5 ${w.chain === 'eth' ? 'text-eth-green border-eth-green/30 bg-eth-green/10' : 'text-sol-purple border-sol-purple/30 bg-sol-purple/10'}`}>
                    {w.chain.toUpperCase()}
                  </span>
                  <span className="text-void-text text-sm font-mono">{w.username}</span>
                  <span className="text-void-muted text-xs font-mono truncate flex-1">{w.address}</span>
                  <span className="text-void-muted text-xs">→</span>
                </Link>
              ))}
            </div>
          )}
          {searchResults.length === 0 && searching === false && searchUsername && (
            <p className="text-void-muted text-xs font-mono">No public wallets found.</p>
          )}
        </div>
      </section>
    </div>
  )
}
