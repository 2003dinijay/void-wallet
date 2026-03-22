'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { getUser, clearAuth, isLoggedIn } from '@/lib/auth'
import { useEffect, useState } from 'react'

export default function NavBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setUser(getUser())
  }, [pathname])

  const logout = () => {
    clearAuth()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="border-b border-void-border bg-void-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold text-white flex items-center gap-1">
          <span className="text-eth-green">V</span>oid<span className="text-sol-purple">W</span>allet
        </Link>

        <div className="flex items-center gap-5 text-sm">
          <Link href="/" className="text-void-muted hover:text-white transition-colors hidden sm:block">Home</Link>
          <Link href="/wallet" className="text-void-muted hover:text-eth-green transition-colors">Wallet</Link>
          <Link href="/sign" className="text-void-muted hover:text-eth-green transition-colors">Sign</Link>
          <Link href="/testnet" className="text-void-muted hover:text-eth-green transition-colors flex items-center gap-1">
            Testnet
            <span className="text-[9px] font-mono px-1 rounded bg-eth-green/10 text-eth-green border border-eth-green/30 leading-4">LIVE</span>
          </Link>
          <Link href="/visualize" className="text-void-muted hover:text-sol-purple transition-colors">Visualize</Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-eth-green font-mono text-xs border border-eth-green/30 rounded px-2 py-1 hover:bg-eth-green/10 transition-all"
              >
                @{user.username}
              </Link>
              <button
                onClick={logout}
                className="text-void-muted hover:text-red-400 transition-colors text-xs font-mono"
              >
                logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-void-muted hover:text-white transition-colors text-xs font-mono">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-eth-green/10 hover:bg-eth-green/20 border border-eth-green/40 text-eth-green font-mono text-xs rounded px-3 py-1.5 transition-all"
              >
                Register
              </Link>
            </div>
          )}

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-void-muted hover:text-white transition-colors border border-void-border rounded px-2 py-1 text-xs hidden md:block"
          >
            API ↗
          </a>
        </div>
      </div>
    </nav>
  )
}
