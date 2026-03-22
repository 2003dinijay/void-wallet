'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/api'
import { saveAuth } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(email, password)
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
          <h1 className="font-display text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-void-muted text-sm">Sign in to your VoidWallet account</p>
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
            <label className="text-xs text-void-muted">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-void-bg border border-void-border focus:border-eth-green rounded-lg px-3 py-2 font-mono text-sm text-void-text outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-mono text-sm bg-eth-green/10 hover:bg-eth-green/20 border border-eth-green/40 text-eth-green transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-void-muted text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-eth-green hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
