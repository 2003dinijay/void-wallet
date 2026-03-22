import { getToken } from './auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

// ─── Crypto ──────────────────────────────────────────────────────────────────
export const generateEthWallet = () => apiFetch('/api/ethereum/generate', { method: 'POST' })
export const generateSolWallet = () => apiFetch('/api/solana/generate', { method: 'POST' })

export interface EthSignPayload {
  private_key: string; to: string; value_eth: number
  gas_limit: number; gas_price_gwei: number; nonce: number; chain_id: number
}
export const signEthTransaction = (p: EthSignPayload) =>
  apiFetch('/api/ethereum/sign', { method: 'POST', body: JSON.stringify(p) })

export interface SolSignPayload {
  private_key_hex: string; recipient: string; lamports: number
}
export const signSolTransaction = (p: SolSignPayload) =>
  apiFetch('/api/solana/sign', { method: 'POST', body: JSON.stringify(p) })

export const getCryptoCompare = () => apiFetch('/api/crypto/compare')

// ─── Auth ────────────────────────────────────────────────────────────────────
export const register = (email: string, username: string, password: string) =>
  apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, username, password }) })

export const login = (email: string, password: string) =>
  apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const getMe = () => apiFetch('/api/auth/me')

// ─── Wallets ─────────────────────────────────────────────────────────────────
export interface SaveWalletPayload {
  chain: 'eth' | 'sol'; address: string; public_key: string
  derivation_path: string; name?: string; is_public?: boolean
}
export const saveWallet = (p: SaveWalletPayload) =>
  apiFetch('/api/wallets/save', { method: 'POST', body: JSON.stringify(p) })

export const getMyWallets = () => apiFetch('/api/wallets/mine')

export const deleteWallet = (id: string) =>
  apiFetch(`/api/wallets/${id}`, { method: 'DELETE' })

export const getWalletByAddress = (address: string) =>
  apiFetch(`/api/wallets/address/${address}`)

export const validateAddress = (chain: 'eth' | 'sol', address: string) =>
  apiFetch(`/api/wallets/validate/${chain}/${address}`)

export const searchWallets = (username?: string, chain?: string) => {
  const params = new URLSearchParams()
  if (username) params.set('username', username)
  if (chain) params.set('chain', chain)
  return apiFetch(`/api/wallets/search?${params}`)
}

// ─── Sepolia Chain ────────────────────────────────────────────────────────────
export const getSepoliaBalance = (address: string) =>
  apiFetch(`/api/chain/balance/${address}`)

export const getSepoliaNonce = (address: string) =>
  apiFetch(`/api/chain/nonce/${address}`)

export const getGasPrice = () =>
  apiFetch('/api/chain/gas-price')

export const broadcastRawTx = (raw_tx: string) =>
  apiFetch('/api/chain/broadcast', { method: 'POST', body: JSON.stringify({ raw_tx }) })

export const getTxStatus = (tx_hash: string) =>
  apiFetch(`/api/chain/tx/${tx_hash}`)

// ─── Counter Contract ─────────────────────────────────────────────────────────
export const getCounterValue = () =>
  apiFetch('/api/counter/value')

export const incrementCounter = (private_key: string) =>
  apiFetch('/api/counter/increment', { method: 'POST', body: JSON.stringify({ private_key }) })

export const resetCounter = (private_key: string) =>
  apiFetch('/api/counter/reset', { method: 'POST', body: JSON.stringify({ private_key }) })
