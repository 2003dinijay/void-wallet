'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { register } from '@/lib/api'
import { saveAuth } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await register(email, username, password)
      saveAuth(res.token, res.user)
      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold text-white">Create account</h1>
          <p className="text-void-muted text-sm">Start generating and saving your wallets</p>
        </div>

        <form onSubmit={submit} className="bg-void-surface border border-void-border rounded-xl p-6 space-y-4">
          {error && (
            <div className="bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-void-muted">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-void-bg border border-void-border focus:border-eth-green rounded-lg px-3 py-2 font-mono text-sm text-void-text outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-void-muted">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full bg-void-bg border border-void-border focus:border-eth-green rounded-lg px-3 py-2 font-mono text-sm text-void-text outline-none transition-colors"
              placeholder="satoshi"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-void-muted">Password (min 6 chars)</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-void-bg border border-void-border focus:border-eth-green rounded-lg px-3 py-2 font-mono text-sm text-void-text outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-mono text-sm bg-eth-green/10 hover:bg-eth-green/20 border border-eth-green/40 text-eth-green transition-all disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-void-muted text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-eth-green hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
