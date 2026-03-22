# 🔐 CryptoWallet — Blockchain Cryptography Coursework Project
## Claude Code Implementation Brief

---

## PROJECT OVERVIEW

Build a **full-stack blockchain wallet demo** for a university cryptography coursework on
"Blockchain and how it relies on cryptographic methods." This is a **Part 2 mini implementation /
proof of concept** that demonstrates real cryptographic primitives.

The app will:
1. Generate Ethereum and Solana wallets from scratch (key pair generation, address derivation)
2. Sign and simulate sending transactions (ECDSA for Ethereum, Ed25519 for Solana)
3. Show every cryptographic step visually (what hash was computed, what curve was used, etc.)
4. Export a summary for the coursework appendix (screenshots, code explanation)

This is an **educational demo** — no real funds, no mainnet. Think of it as a cryptography
visualizer + wallet generator.

---

## TECH STACK

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend   | Python 3.11+ with FastAPI         |
| Crypto    | `eth-account`, `web3`, `solders`, `mnemonic`, `bip_utils`, `pynacl` (Python) |
| Styling   | Tailwind CSS + custom CSS variables for a dark crypto aesthetic |
| API Comm  | REST (fetch from Next.js to FastAPI) |

---

## PROJECT STRUCTURE

```
project-root/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing / home
│   │   ├── wallet/
│   │   │   └── page.tsx       # Wallet generator page
│   │   ├── sign/
│   │   │   └── page.tsx       # Transaction signing page
│   │   └── visualize/
│   │       └── page.tsx       # Cryptographic steps visualizer
│   ├── components/
│   │   ├── WalletCard.tsx
│   │   ├── StepVisualizer.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── HashDisplay.tsx
│   │   └── CryptoExplainer.tsx
│   ├── lib/
│   │   └── api.ts             # API calls to FastAPI backend
│   └── public/
│
├── backend/                   # Python FastAPI
│   ├── main.py                # FastAPI entry point
│   ├── routers/
│   │   ├── ethereum.py        # Ethereum wallet + signing endpoints
│   │   ├── solana.py          # Solana wallet + signing endpoints
│   │   └── crypto_info.py     # Returns step-by-step crypto breakdowns
│   ├── services/
│   │   ├── eth_wallet.py      # Core Ethereum cryptography logic
│   │   ├── sol_wallet.py      # Core Solana cryptography logic
│   │   └── mnemonic_service.py
│   └── requirements.txt
│
└── README.md
```

---

## BACKEND — FastAPI (Python)

### `requirements.txt`
```
fastapi
uvicorn[standard]
eth-account
web3
mnemonic
bip_utils
pynacl
base58
python-dotenv
```

### API Endpoints to implement

#### POST `/api/ethereum/generate`
Generates a new Ethereum wallet.

**Response:**
```json
{
  "mnemonic": "word1 word2 ... word12",
  "private_key": "0xabc123...",
  "public_key": "0x04abc...",
  "address": "0xChecksummedAddress",
  "derivation_path": "m/44'/60'/0'/0/0",
  "steps": [
    { "step": 1, "name": "Generate Entropy", "detail": "128 bits from os.urandom(16)", "output": "hex_string" },
    { "step": 2, "name": "BIP-39 Mnemonic", "detail": "Entropy → checksum → 12 words", "output": "mnemonic" },
    { "step": 3, "name": "PBKDF2-HMAC-SHA512", "detail": "Mnemonic → 512-bit seed (2048 rounds)", "output": "seed_hex" },
    { "step": 4, "name": "BIP-32 HD Derivation", "detail": "m/44'/60'/0'/0/0", "output": "child_private_key" },
    { "step": 5, "name": "secp256k1 EC Multiply", "detail": "private_key × G → uncompressed public key", "output": "public_key" },
    { "step": 6, "name": "Keccak-256 Hash", "detail": "Hash last 64 bytes of public key", "output": "keccak_hash" },
    { "step": 7, "name": "Address Extraction", "detail": "Take last 20 bytes + EIP-55 checksum", "output": "address" }
  ]
}
```

#### POST `/api/ethereum/sign`
Signs a simulated ETH transaction.

**Request body:**
```json
{
  "private_key": "0x...",
  "to": "0x...",
  "value_eth": 0.01,
  "gas_limit": 21000,
  "gas_price_gwei": 20,
  "nonce": 0,
  "chain_id": 1
}
```

**Response:**
```json
{
  "raw_transaction": "0xf86c...",
  "transaction_hash": "0xabc...",
  "signature": { "r": "0x...", "s": "0x...", "v": 37 },
  "steps": [
    { "step": 1, "name": "Build Transaction", "detail": "nonce, gasPrice, gasLimit, to, value, data, chainID", "output": "tx_dict" },
    { "step": 2, "name": "RLP Encode", "detail": "Recursive Length Prefix encoding", "output": "rlp_hex" },
    { "step": 3, "name": "Keccak-256 Hash", "detail": "Hash the RLP-encoded transaction", "output": "tx_hash" },
    { "step": 4, "name": "ECDSA Sign (secp256k1)", "detail": "sign(private_key, tx_hash) → r, s, v", "output": "signature" },
    { "step": 5, "name": "EIP-155 Replay Protection", "detail": "v = {0,1} + chainID × 2 + 35", "output": "v_value" }
  ]
}
```

#### POST `/api/solana/generate`
Generates a new Solana wallet.

**Response:**
```json
{
  "mnemonic": "word1 ... word12",
  "private_key_hex": "abc123...",
  "public_key_base58": "7xKXtg...",
  "secret_key_b64": "...",
  "derivation_path": "m/44'/501'/0'/0'",
  "steps": [
    { "step": 1, "name": "Generate Entropy", "detail": "128 bits of randomness" },
    { "step": 2, "name": "BIP-39 Mnemonic", "detail": "12-word seed phrase" },
    { "step": 3, "name": "PBKDF2-HMAC-SHA512", "detail": "Mnemonic → 512-bit seed" },
    { "step": 4, "name": "BIP-44 Derivation", "detail": "m/44'/501'/0'/0' (all hardened)" },
    { "step": 5, "name": "Ed25519 Keypair", "detail": "Derive keypair over Curve25519" },
    { "step": 6, "name": "Solana Address", "detail": "Public key in Base58Check encoding" }
  ]
}
```

#### POST `/api/solana/sign`
Signs a simulated Solana transfer.

**Request body:**
```json
{
  "private_key_hex": "...",
  "recipient": "7xKX...",
  "lamports": 1000000
}
```

**Response:**
```json
{
  "message_bytes_hex": "...",
  "signature_hex": "...",
  "signature_base58": "...",
  "is_deterministic": true,
  "steps": [
    { "step": 1, "name": "Build Message", "detail": "Serialize: recipient, lamports, recent_blockhash" },
    { "step": 2, "name": "Ed25519 Sign", "detail": "sign(private_key, message) → 64-byte deterministic signature" },
    { "step": 3, "name": "No Nonce Needed", "detail": "Ed25519 is deterministic — same input = same signature" }
  ]
}
```

#### GET `/api/crypto/compare`
Returns a static comparison of ECDSA vs Ed25519 vs BLS for the visualizer page.

---

## BACKEND — Core Python Logic

### `services/eth_wallet.py` — key logic to implement

```python
import os
import hashlib
from eth_account import Account
from eth_keys import keys
from mnemonic import Mnemonic
from bip_utils import Bip39SeedGenerator, Bip44, Bip44Coins, Bip44Changes
import sha3  # pysha3 for Keccak-256

Account.enable_unaudited_hdwallet_features()

def generate_ethereum_wallet():
    # 1. Generate 128-bit entropy
    entropy = os.urandom(16)

    # 2. BIP-39 mnemonic from entropy
    mnemo = Mnemonic("english")
    mnemonic_phrase = mnemo.to_mnemonic(entropy)

    # 3. PBKDF2-HMAC-SHA512: mnemonic → 512-bit seed
    seed = Bip39SeedGenerator(mnemonic_phrase).Generate()

    # 4. BIP-32/44 derivation: m/44'/60'/0'/0/0
    bip44_mst_ctx = Bip44.FromSeed(seed, Bip44Coins.ETHEREUM)
    bip44_acc_ctx = bip44_mst_ctx.Purpose().Coin().Account(0).Change(Bip44Changes.CHAIN_EXT).AddressIndex(0)
    private_key_bytes = bip44_acc_ctx.PrivateKey().Raw().ToBytes()

    # 5. secp256k1: private key × G = public key
    pk = keys.PrivateKey(private_key_bytes)
    public_key = pk.public_key

    # 6. Keccak-256 of last 64 bytes of uncompressed public key
    keccak = sha3.keccak_256()
    keccak.update(public_key.to_bytes())
    address_bytes = keccak.digest()[-20:]

    # 7. EIP-55 checksum address
    address = "0x" + address_bytes.hex()

    return { "mnemonic": mnemonic_phrase, "private_key": "0x" + private_key_bytes.hex(), ... }
```

### `services/sol_wallet.py` — key logic to implement

```python
import os
from mnemonic import Mnemonic
from bip_utils import Bip39SeedGenerator, Bip44, Bip44Coins
import nacl.signing
import base58

def generate_solana_wallet():
    entropy = os.urandom(16)
    mnemo = Mnemonic("english")
    mnemonic_phrase = mnemo.to_mnemonic(entropy)

    seed = Bip39SeedGenerator(mnemonic_phrase).Generate()

    # BIP-44 for Solana: m/44'/501'/0'/0' (all hardened)
    bip44_mst = Bip44.FromSeed(seed, Bip44Coins.SOLANA)
    account = bip44_mst.Purpose().Coin().Account(0).Change(0)  # adjust for hardened
    private_key_bytes = account.PrivateKey().Raw().ToBytes()[:32]

    # Ed25519 keypair
    signing_key = nacl.signing.SigningKey(private_key_bytes)
    verify_key = signing_key.verify_key
    public_key_bytes = bytes(verify_key)

    # Solana address = Base58 of public key
    address = base58.b58encode(public_key_bytes).decode()

    return { "mnemonic": mnemonic_phrase, "public_key_base58": address, ... }

def sign_solana_transaction(private_key_hex, recipient, lamports):
    private_key_bytes = bytes.fromhex(private_key_hex)
    signing_key = nacl.signing.SigningKey(private_key_bytes)

    # Build a minimal message
    message = f"Transfer {lamports} lamports to {recipient}".encode()
    signed = signing_key.sign(message)
    signature = signed.signature  # deterministic 64-byte Ed25519 signature

    return { "signature_hex": signature.hex(), "is_deterministic": True, ... }
```

---

## FRONTEND — Next.js Design & Pages

### Design Aesthetic

Go for a **dark, terminal-inspired crypto aesthetic**:
- Background: `#0a0a0f` (near black)
- Primary accent: `#00ff88` (matrix green) for Ethereum
- Secondary accent: `#9945ff` (Solana purple) for Solana
- Surface cards: `#12121a` with `1px solid #1e1e2e` border
- Typography: `JetBrains Mono` for code/hashes, `Syne` for headings
- Animations: typing effect for hash outputs, glowing borders on active steps, smooth transitions
- Monospace hash displays with `letter-spacing: 0.05em`

Use Tailwind with a custom `tailwind.config.js` that extends colors with the above palette.

### Page 1: `/` — Landing Page
- Hero section: "Blockchain Cryptography — Live Demo"
- Two large cards: "Ethereum Wallet (ECDSA + secp256k1)" and "Solana Wallet (Ed25519 + Curve25519)"
- Brief bullet-point explainer of what each cryptographic algorithm does
- CTA buttons: "Generate Ethereum Wallet" / "Generate Solana Wallet"

### Page 2: `/wallet` — Wallet Generator
- Toggle between ETH and SOL modes
- Big "Generate Wallet" button (calls backend)
- **StepVisualizer component**: animated step-by-step display showing each cryptographic operation as it "runs" (animate steps appearing with a typing/glow effect)
- Display boxes for:
  - Mnemonic phrase (12 words, blurred by default, reveal on click)
  - Private key (always blurred, show only for demo purposes with a warning)
  - Public key
  - Address / Wallet address
- Copy-to-clipboard buttons on all fields
- Bottom panel: "What just happened?" — plain English explanation of each step

### Page 3: `/sign` — Transaction Signer
- Form inputs:
  - Recipient address
  - Amount (ETH or SOL)
  - Optional: gas price (ETH only)
- Paste private key OR use the generated one from the session
- Sign button (calls backend)
- Output display:
  - Signature (r, s, v for ETH; 64-byte hex for SOL)
  - Transaction hash
  - Raw/serialized transaction
- StepVisualizer showing signing steps
- Side panel: "Why is Ed25519 deterministic but ECDSA isn't?" — short explainer

### Page 4: `/visualize` — Cryptography Explainer
- Interactive comparison table: ECDSA vs Ed25519 vs BLS
- Visual diagram: key derivation path (BIP-39 → BIP-32 → address)
- Animated: show how changing the mnemonic changes every downstream value
- Keccak-256 live hasher: type anything, see the hash update in real-time (client-side using a JS keccak library)
- ZKP explainer section: simplified Groth16 proof flow diagram

---

## SHARED COMPONENTS

### `StepVisualizer.tsx`
```tsx
// Props: steps: Array<{step: number, name: string, detail: string, output: string}>
// Renders each step as a card that animates in sequentially
// Each card has: step number badge, step name, technical detail, output hash/value in monospace
// Green checkmark appears when step completes
// Glowing green/purple border on the currently active step
```

### `HashDisplay.tsx`
```tsx
// Props: label: string, value: string, blurred?: boolean, copiable?: boolean
// Monospace display of hashes/keys
// Optional blur overlay with "Click to reveal" for sensitive values
// Copy-to-clipboard with toast notification
```

### `lib/api.ts`
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function generateEthWallet() {
  const res = await fetch(`${API_BASE}/api/ethereum/generate`, { method: "POST" });
  return res.json();
}

export async function signEthTransaction(payload: EthSignPayload) {
  const res = await fetch(`${API_BASE}/api/ethereum/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function generateSolWallet() { ... }
export async function signSolTransaction(payload: SolSignPayload) { ... }
```

---

## FASTAPI CORS SETUP

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CryptoWallet API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## RUNNING THE PROJECT

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev  # runs on http://localhost:3000
```

---

## COURSEWORK NOTES (for report appendix)

- The app deliberately exposes intermediate cryptographic values (entropy, seed, derivation path) 
  that real wallets hide, specifically to illustrate the cryptographic pipeline
- All private keys shown are for demonstration only — clearly labeled in the UI
- No real transactions are broadcast; this is a simulation
- The "steps" JSON from the backend should be used verbatim as code evidence in the appendix
- Add screenshots of each page for the report
- The `/visualize` page's comparison table maps directly to the report's Section 2 (ZKP analysis)

---

## KEY CRYPTOGRAPHIC CONCEPTS TO DEMONSTRATE

| Concept | Where Demonstrated |
|---|---|
| secp256k1 ECDSA | Ethereum key generation + signing page |
| Ed25519 determinism | Solana signing (highlight: same input = same signature) |
| Keccak-256 | Ethereum address derivation step |
| BIP-39 Mnemonic | Both wallet generators |
| BIP-32/44 HD Derivation | Derivation path display |
| PBKDF2-HMAC-SHA512 | Step 3 of wallet generation |
| EIP-155 Replay Protection | Ethereum signing steps |
| ZKP Conceptual Explainer | /visualize page |

---

## IMPORTANT IMPLEMENTATION NOTES

1. **Never use `Math.random()` for anything cryptographic** — use `crypto.getRandomValues()` in JS
2. **Keep all actual crypto on the backend (Python)** — the frontend only displays results
3. **Private keys are never stored** — session state only, cleared on page refresh
4. Add a prominent **"⚠️ DEMO ONLY — Never use these keys with real funds"** warning banner
5. Each API response includes the `steps` array — always render this in the StepVisualizer
6. Use `python-dotenv` for any config; use `NEXT_PUBLIC_API_URL` env var for the API base URL
7. Add a `/docs` link in the navbar pointing to FastAPI's auto-generated Swagger UI at `/docs`
