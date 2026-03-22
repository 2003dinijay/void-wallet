# VoidWallet — Project Overview (Plain English)

## What is this project?

VoidWallet is an **educational crypto wallet demo** built for a university coursework on blockchain cryptography.

It started as a pure simulation — performing the same math real wallets use, showing every step. It has since been extended to **connect to the real Ethereum Sepolia testnet**, so you can broadcast actual transactions, check live balances, and interact with a deployed Solidity smart contract.

Think of it like a **calculator that shows its working**, then lets you submit the answer to a real blockchain.

---

## What does it actually do?

### 1. User Accounts
You can register and log in. Each user has their own account stored in MongoDB. Passwords are hashed with bcrypt and authentication uses JWT tokens.

### 2. Generate Wallets
You click a button → it creates a brand new Ethereum or Solana wallet from scratch:
- Generates a **random secret** (your private key)
- Derives a **public address** from that secret using cryptographic math
- Shows you **every step** of that process
- Lets you **save** the wallet to your account (address + public key only — private key is never stored)

### 3. Sign Transactions
You fill in a transaction (recipient, amount, gas) → it:
- Digitally signs the transaction using your private key
- Shows you the raw signature bytes and every intermediate step
- Returns the `raw_transaction` hex — ready to broadcast

### 4. Broadcast to Sepolia Testnet (LIVE blockchain)
On the Testnet page you can:
- Paste the signed raw transaction hex from the Sign page and send it to the real Sepolia network
- See it appear on Sepolia Etherscan within seconds
- Check live balances and current gas prices via Alchemy RPC

### 5. Counter Smart Contract (LIVE on Sepolia)
A simple Solidity contract (`Counter.sol`) is deployed on Sepolia. The Testnet page lets you:
- Read the current count (live on-chain read)
- Increment the counter — signs a real transaction with your private key and broadcasts it
- Reset to zero (only the deployer can do this)
- Track every transaction on Sepolia Etherscan

### 6. Share Wallets
Every saved wallet gets a public URL like:
```
http://localhost:3000/wallet/0xYourAddress
```
Anyone can open that link and see your address and public key. Nothing sensitive is exposed — private keys are never stored anywhere.

### 7. Validate Addresses
The dashboard has a built-in address validator. Paste any ETH or SOL address and it tells you:
- Whether the format is correct
- Whether the EIP-55 checksum is right (ETH)
- The corrected checksummed address if it's wrong

### 8. Search Public Wallets
Search other users' public wallets by username or chain type.

### 9. Visualize Cryptography
A page that explains and compares the different cryptographic algorithms:
- ECDSA vs Ed25519 vs BLS comparison table
- Key derivation pipeline diagram
- Live hash demo (type text, see SHA-256 output change instantly)
- ZKP (Zero-Knowledge Proof) explainer

---

## Two Separate Projects

```
VoidWallet/
├── backend/     ← Python (crypto math + database + blockchain RPC calls)
└── frontend/    ← Website (the visual interface you see)
```

They talk to each other: the website sends requests to the Python server, Python does the crypto and database work (and talks to the blockchain via Alchemy), sends back results, and the website displays them.

---

## Database

User accounts and saved wallets are stored in **MongoDB Atlas** (cloud database).

The `.env` file in the backend holds the connection string — it is gitignored and never committed to GitHub.

What IS stored in the database:
- User email, username, hashed password
- Wallet address, public key, chain, name

What is NEVER stored:
- Private keys
- Mnemonic seed phrases

---

## Blockchain Connection

The backend connects to the **Ethereum Sepolia testnet** via **Alchemy** (a blockchain RPC provider). The Alchemy URL is stored in `.env`.

Sepolia is a test network — it uses play-money ETH that has no real value. You can get free Sepolia ETH from faucets to test with.

---

## How to run it

```bash
# Terminal 1 — Start the Python backend
cd backend
source venv/Scripts/activate    # Git Bash
uvicorn main:app --reload --port 8000

# Terminal 2 — Start the website
cd frontend
npm install   # first time only
npm run dev
```

Then open your browser:
- Website → http://localhost:3000
- API docs → http://localhost:8000/docs

---

## Key rule
⚠️ **Never use the generated keys with real money.** The Sepolia testnet uses fake ETH only — this is for learning.
