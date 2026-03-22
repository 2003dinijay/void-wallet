# VoidWallet — Documentation Index

Start here. Read these docs in order if you're new to the project.

---

## Reading Order

| # | Doc | What you'll learn |
|---|---|---|
| 1 | [OVERVIEW.md](./OVERVIEW.md) | What the project is and how to run it (5 min read) |
| 2 | [HOW_CRYPTO_WORKS.md](./HOW_CRYPTO_WORKS.md) | How wallets and signatures actually work, step by step |
| 3 | [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Every file explained — what it does and why it exists |
| 4 | [RUNNING_THE_PROJECT.md](./RUNNING_THE_PROJECT.md) | Full setup guide with troubleshooting |
| 5 | [API_REFERENCE.md](./API_REFERENCE.md) | Every API endpoint with request/response examples |
| 6 | [GLOSSARY.md](./GLOSSARY.md) | Every crypto/technical term explained simply |

---

## Quick Reference

### Start the project
```bash
# Terminal 1 — Backend
cd backend && source venv/Scripts/activate && uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### Key URLs
| URL | What it is |
|---|---|
| http://localhost:3000 | Main website |
| http://localhost:3000/register | Create an account |
| http://localhost:3000/login | Sign in |
| http://localhost:3000/dashboard | Your wallets + address validator |
| http://localhost:3000/wallet | Generate a wallet |
| http://localhost:3000/sign | Sign a transaction |
| http://localhost:3000/testnet | **Live Sepolia testnet — Counter contract + broadcaster** |
| http://localhost:3000/visualize | Crypto comparison + ZKP explainer |
| http://localhost:8000/docs | FastAPI Swagger UI |

### Tech Stack
| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind | Modern React, great DX |
| Backend | Python + FastAPI | Best crypto library support |
| Database | MongoDB Atlas + Motor | Async, cloud-hosted |
| Auth | JWT + bcrypt | Stateless tokens, secure password hashing |
| Ethereum crypto | eth-account, eth-keys, bip_utils | Industry standard |
| Solana crypto | pynacl (Ed25519), bip_utils | Battle-tested |
| Hashing | pycryptodome (Keccak-256) | Cross-platform, no C build issues |
| Blockchain RPC | web3.py + Alchemy | Connect to Sepolia testnet |
| Smart contract | Solidity 0.8.20 (Counter.sol) | Deployed on Sepolia |

### What the app demonstrates
- User accounts — register, login, JWT auth
- BIP-39 mnemonic generation
- PBKDF2-HMAC-SHA512 seed derivation
- BIP-32/44 HD wallet derivation
- secp256k1 ECDSA (Ethereum)
- Curve25519 Ed25519 (Solana)
- Keccak-256 hashing
- EIP-55 address checksum validation
- EIP-155 replay protection
- Transaction signing (both chains)
- Save wallets to MongoDB — shareable public URLs
- Address validation (ETH checksum + SOL base58)
- **Live Sepolia ETH balance + gas price via Alchemy RPC**
- **Broadcast signed transactions to real Sepolia testnet**
- **Counter smart contract — read/increment/reset on-chain**
- **Transaction status tracking + Etherscan links**
- ECDSA vs Ed25519 comparison
- Groth16 ZKP explainer

### Counter contract quick-start
```bash
# 1. Get free Sepolia ETH from https://sepoliafaucet.com
# 2. Deploy the contract (one-time):
cd backend && pip install py-solc-x
python deploy_counter.py
# 3. Add the printed address to .env:
#    COUNTER_CONTRACT_ADDRESS=0x...
# 4. Restart the backend
# 5. Visit http://localhost:3000/testnet
```
