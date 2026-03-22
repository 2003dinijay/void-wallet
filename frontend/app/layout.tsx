import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'VoidWallet — Blockchain Cryptography Demo',
  description: 'Educational demonstration of Ethereum and Solana cryptographic primitives',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-void-bg text-void-text">
        <div className="bg-yellow-900/40 border-b border-yellow-600/30 text-yellow-400 text-xs font-mono text-center py-2 px-4">
          ⚠️ DEMO ONLY — Never use these keys with real funds. Educational cryptography visualizer.
        </div>
        <NavBar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-void-border text-center text-void-muted text-xs py-6 font-mono mt-16">
          Blockchain Cryptography Coursework — Educational Demo Only
        </footer>
      </body>
    </html>
  )
}
