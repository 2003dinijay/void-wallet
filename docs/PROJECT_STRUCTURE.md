# Project Structure Explained

Every file in the project, explained in plain English.

---

## Top Level

```
VoidWallet/
├── backend/         The Python server (crypto + auth + database + blockchain RPC)
├── frontend/        The Next.js website (what users see)
├── docs/            Documentation (you are here)
├── ref/             Reference files (original brief, notes)
└── .gitignore       Root gitignore (OS files, editors)
```

---

## Backend (`backend/`)

```
backend/
├── main.py                   ← Entry point. Starts the server, connects to MongoDB, sets up all routes.
├── requirements.txt          ← List of Python packages to install
├── .env                      ← Secrets: MongoDB URL, JWT secret, Alchemy URL (gitignored — never committed)
├── .env.example              ← Template showing what .env should contain (safe to commit)
├── .gitignore                ← Ignores venv/, __pycache__/, .env
├── venv/                     ← Python virtual environment (gitignored)
├── Counter.sol               ← Solidity source for the Counter smart contract
├── deploy_counter.py         ← One-time script to compile + deploy Counter to Sepolia
│
├── database.py               ← MongoDB connection via Motor (async). Exposes get_db().
├── auth.py                   ← JWT creation/decoding, bcrypt password hashing,
│                                FastAPI dependencies (get_current_user, get_current_user_optional)
│
├── routers/                  ← API endpoints (what URLs the server responds to)
│   ├── __init__.py
│   ├── ethereum.py           ← POST /api/ethereum/generate + /sign
│   ├── solana.py             ← POST /api/solana/generate + /sign
│   ├── crypto_info.py        ← GET /api/crypto/compare (static comparison data)
│   ├── auth.py               ← POST /api/auth/register + /login | GET /api/auth/me
│   ├── user_wallets.py       ← POST /api/wallets/save | GET /api/wallets/mine
│   │                            DELETE /api/wallets/{id}
│   │                            GET /api/wallets/address/{address}
│   │                            GET /api/wallets/validate/{chain}/{address}
│   │                            GET /api/wallets/search
│   ├── blockchain.py         ← GET /api/chain/balance/{address}
│   │                            GET /api/chain/nonce/{address}
│   │                            GET /api/chain/gas-price
│   │                            POST /api/chain/broadcast
│   │                            GET /api/chain/tx/{tx_hash}
│   └── counter.py            ← GET /api/counter/value
│                                POST /api/counter/increment
│                                POST /api/counter/reset
│
└── services/                 ← Core logic (called by routers)
    ├── __init__.py
    ├── eth_wallet.py         ← Ethereum key generation + signing (secp256k1, Keccak-256, BIP-32)
    ├── sol_wallet.py         ← Solana key generation + signing (Ed25519, Curve25519, BIP-44)
    ├── mnemonic_service.py   ← BIP-39 helper utilities
    ├── blockchain.py         ← web3.py connection to Sepolia via Alchemy
    │                            balance / nonce / gas price / broadcast / tx status
    └── counter_contract.py   ← Counter ABI + get_count() / increment_counter() / reset_counter()
```

### How a request flows through the backend

**Wallet generation:**
```
Browser sends POST /api/ethereum/generate
        ↓
main.py  (receives it, routes to correct file)
        ↓
routers/ethereum.py  (calls the service)
        ↓
services/eth_wallet.py  (runs all 7 crypto steps)
        ↓
Returns JSON { mnemonic, private_key, public_key, address, steps } back to browser
```

**Counter increment:**
```
Browser sends POST /api/counter/increment  { private_key: "0x..." }
        ↓
routers/counter.py  (validates input)
        ↓
services/counter_contract.py  (builds increment() tx, signs with private key)
        ↓
Alchemy RPC  (broadcasts signed tx to Sepolia)
        ↓
Returns JSON { tx_hash, etherscan_url, ... } back to browser
```

---

## Frontend (`frontend/`)

```
frontend/
├── package.json              ← JS package list
├── next.config.js            ← Next.js configuration
├── tsconfig.json             ← TypeScript configuration
├── tailwind.config.js        ← Custom colors: void-bg, eth-green, sol-purple, etc.
├── postcss.config.js         ← Required by Tailwind
├── .env.local.example        ← Template: set NEXT_PUBLIC_API_URL here
├── .gitignore                ← Ignores node_modules/, .next/, .env.local
│
├── app/                      ← Pages (Next.js App Router — each folder = a URL)
│   ├── layout.tsx            ← Shared layout: NavBar + warning banner + footer
│   ├── page.tsx              ← Home page → /
│   ├── globals.css           ← Global CSS: dark theme, fonts, animations
│   │
│   ├── register/
│   │   └── page.tsx          ← Register page → /register
│   │
│   ├── login/
│   │   └── page.tsx          ← Login page → /login
│   │
│   ├── dashboard/
│   │   └── page.tsx          ← Dashboard → /dashboard
│   │                            (my wallets, address validator, search)
│   │
│   ├── wallet/
│   │   ├── page.tsx          ← Wallet generator → /wallet
│   │   └── [address]/
│   │       └── page.tsx      ← Public share page → /wallet/0xAbc123...
│   │
│   ├── sign/
│   │   └── page.tsx          ← Transaction signer → /sign
│   │
│   ├── testnet/
│   │   └── page.tsx          ← Sepolia testnet panel → /testnet
│   │                            (Counter contract, balance checker, broadcaster, tx status)
│   │
│   └── visualize/
│       └── page.tsx          ← Crypto visualizer → /visualize
│
├── components/               ← Reusable UI pieces
│   ├── NavBar.tsx            ← Navbar (shows Login/Register or username/logout based on auth state)
│   ├── StepVisualizer.tsx    ← Animated crypto step cards (01, 02, 03...)
│   ├── HashDisplay.tsx       ← Hash/key display with blur, reveal, copy
│   ├── WalletCard.tsx        ← ETH/SOL card on the home page
│   ├── CryptoExplainer.tsx   ← Plain English explanation of each crypto step
│   └── TransactionForm.tsx   ← Input form for signing transactions
│
└── lib/
    ├── api.ts                ← All API calls to the backend (crypto + auth + wallets + chain + counter)
    └── auth.ts               ← Auth helpers: save/get/clear token in localStorage
```

---

## The Pages

### `/` — Home (`app/page.tsx`)
Landing page with ETH/SOL wallet cards and links to other pages.

### `/register` — Register (`app/register/page.tsx`)
Create a new account. On success, token is saved and user is redirected to the dashboard.

### `/login` — Login (`app/login/page.tsx`)
Sign into an existing account. On success, token is saved and user is redirected to the dashboard.

### `/dashboard` — Dashboard (`app/dashboard/page.tsx`)
The main hub after login. Three sections:
1. **My Wallets** — list of saved wallets with Share and Delete buttons
2. **Validate Address** — paste any ETH/SOL address to check if it's valid
3. **Search Public Wallets** — find other users' public wallets by username or chain

### `/wallet` — Wallet Generator (`app/wallet/page.tsx`)
Generate an ETH or SOL wallet. Shows mnemonic, private key (blurred), public key, address, and step-by-step breakdown. If logged in, shows a "Save to Account" button.

### `/wallet/[address]` — Public Share Page (`app/wallet/[address]/page.tsx`)
Public page for a saved wallet. Shows chain, address, public key, owner username, derivation path. Accessible by anyone — contains no sensitive data.

### `/sign` — Transaction Signer (`app/sign/page.tsx`)
Sign a transaction with a private key. Shows raw ECDSA or Ed25519 signature and the full `raw_transaction` hex. Use the Testnet page to broadcast that hex to Sepolia.

### `/testnet` — Sepolia Testnet (`app/testnet/page.tsx`)
Live blockchain interaction panel. Five sections:
1. **Counter Contract** — read count, increment (signs + broadcasts a real tx), reset (owner only)
2. **Balance Checker** — enter any ETH address, see live Sepolia ETH balance
3. **Gas Price** — current Sepolia network gas price in Gwei
4. **Broadcast Raw Transaction** — paste signed hex from the Sign page and send to Sepolia
5. **Transaction Status** — check if a tx hash has been mined

### `/visualize` — Crypto Visualizer (`app/visualize/page.tsx`)
Algorithm comparison, key derivation pipeline, live hash demo, ZKP explainer.

---

## Key Files Explained

### `lib/auth.ts`
Saves and reads the JWT token from localStorage. Used by `api.ts` to attach the `Authorization: Bearer` header to protected requests. Also used by the NavBar to show the correct logged-in/logged-out state.

### `lib/api.ts`
Every single API call in one file — crypto, auth, wallets, chain info, and counter contract. Functions auto-attach the auth token when present. If you ever change the backend URL, only this file needs updating.

### `auth.py` (backend)
Two jobs:
1. Password hashing — `hash_password()` and `verify_password()` using `bcrypt` directly (not passlib, which is incompatible with bcrypt 4+)
2. JWT — `create_token()`, `decode_token()`, and the FastAPI `Depends` functions `get_current_user` / `get_current_user_optional`

### `database.py` (backend)
Creates the MongoDB Motor client on startup and closes it on shutdown. Exposes `get_db()` which returns the database instance used by all routers.

### `services/blockchain.py` (backend)
Creates a web3.py connection to Sepolia using the Alchemy URL from `.env`. Provides functions for reading chain state (balance, nonce, gas price) and broadcasting signed transactions.

### `services/counter_contract.py` (backend)
Contains the Counter contract's ABI (the interface definition). Functions: `get_count()` calls the contract read-only; `increment_counter(private_key)` builds + signs + broadcasts an `increment()` call; `reset_counter(private_key)` does the same for `reset()`.

### `Counter.sol` (backend)
The Solidity source code for the on-chain Counter. Compiled and deployed by `deploy_counter.py`. Not needed at runtime — the backend only uses the compiled ABI.

### `deploy_counter.py` (backend)
One-time script. Compiles `Counter.sol` using `py-solc-x`, deploys it to Sepolia, and prints the deployed contract address. Run this once, then add the address to `.env` as `COUNTER_CONTRACT_ADDRESS`.

---

## MongoDB Collections

### `users`
```
{
  _id:           ObjectId,
  email:         string  (unique),
  username:      string  (unique),
  password_hash: string  (bcrypt hash — never the plaintext password),
  created_at:    datetime
}
```

### `wallets`
```
{
  _id:             ObjectId,
  user_id:         ObjectId  (links to users._id),
  username:        string    (denormalised for fast search),
  name:            string    (user-chosen label),
  chain:           "eth" | "sol",
  address:         string    (indexed),
  public_key:      string,
  derivation_path: string,
  is_public:       bool,
  created_at:      datetime
}
```

**What is never stored:** private keys, mnemonic phrases.

---

## Configuration Files

| File | What it does |
|---|---|
| `backend/.env` | MongoDB URL, JWT secret, Alchemy URL, Counter contract address — gitignored |
| `backend/.env.example` | Safe template showing which variables are needed |
| `frontend/.env.local.example` | Template for `NEXT_PUBLIC_API_URL` |
| `tailwind.config.js` | Custom colour palette (`void-bg`, `eth-green`, `sol-purple`) |
| `tsconfig.json` | `@/*` path alias means "from the frontend/ root" |
| `venv/` | Python virtual environment — gitignored, recreated with `pip install -r requirements.txt` |
