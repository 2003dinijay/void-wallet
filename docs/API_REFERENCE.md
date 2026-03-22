# API Reference

All endpoints exposed by the Python backend. Test them interactively at http://localhost:8000/docs (Swagger UI).

**Base URL:** `http://localhost:8000`

Protected endpoints require an `Authorization: Bearer <token>` header. Get a token by calling `/api/auth/login` or `/api/auth/register`.

---

## Auth Endpoints

### POST `/api/auth/register`
Create a new user account.

**Request body:**
```json
{
  "email": "you@example.com",
  "username": "satoshi",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "64f3a...",
    "email": "you@example.com",
    "username": "satoshi",
    "created_at": "2024-01-01T00:00:00"
  }
}
```

**Errors:** `400` if email or username already taken, password too short.

---

### POST `/api/auth/login`
Sign into an existing account.

**Request body:**
```json
{
  "email": "you@example.com",
  "password": "yourpassword"
}
```

**Response:** Same shape as `/register`.

**Errors:** `401` if email not found or password wrong.

---

### GET `/api/auth/me`
Get the currently logged-in user. Requires auth token.

**Response:**
```json
{
  "id": "64f3a...",
  "email": "you@example.com",
  "username": "satoshi",
  "created_at": "2024-01-01T00:00:00"
}
```

---

## Wallet Management Endpoints

### POST `/api/wallets/save` 🔒
Save a generated wallet to your account. Requires auth.

**Request body:**
```json
{
  "chain": "eth",
  "address": "0xAb5801a7D398351b...",
  "public_key": "04b3c8f2a1...",
  "derivation_path": "m/44'/60'/0'/0/0",
  "name": "My Main ETH Wallet",
  "is_public": true
}
```

**Note:** Never send the private key or mnemonic to this endpoint. Only address + public key.

**Response:**
```json
{
  "id": "64f3b...",
  "user_id": "64f3a...",
  "username": "satoshi",
  "name": "My Main ETH Wallet",
  "chain": "eth",
  "address": "0xAb5801a7D398351b...",
  "public_key": "04b3c8f2a1...",
  "derivation_path": "m/44'/60'/0'/0/0",
  "is_public": true,
  "created_at": "2024-01-01T00:00:00"
}
```

**Errors:** `400` if wallet already saved by this user.

---

### GET `/api/wallets/mine` 🔒
Get all wallets saved by the logged-in user. Requires auth.

**Response:** Array of wallet objects (same shape as save response), sorted newest first.

---

### DELETE `/api/wallets/{wallet_id}` 🔒
Delete a saved wallet. Requires auth. Only the owner can delete.

**Response:**
```json
{ "deleted": true }
```

**Errors:** `404` if wallet not found or doesn't belong to you.

---

### GET `/api/wallets/address/{address}`
Get a wallet by its address. Public wallets accessible to anyone. Private wallets require auth and ownership.

**Example:** `GET /api/wallets/address/0xAb5801a7D398351b...`

**Response:** Wallet object (same shape as save response).

**Errors:** `404` if not found, `403` if private and not your wallet.

---

### GET `/api/wallets/validate/{chain}/{address}`
Validate a wallet address format. No auth required.

**Examples:**
- `GET /api/wallets/validate/eth/0xAb5801a7D398351b...`
- `GET /api/wallets/validate/sol/7xKXtg2CW87d97TX...`

**ETH Response (valid, correct checksum):**
```json
{
  "chain": "eth",
  "valid": true,
  "checksummed": "0xAb5801a7D398351b...",
  "checksum_ok": true,
  "error": null
}
```

**ETH Response (valid address, wrong checksum):**
```json
{
  "chain": "eth",
  "valid": true,
  "checksummed": "0xAb5801a7D398351b...",
  "checksum_ok": false,
  "error": "Address is valid but EIP-55 checksum is wrong — use the corrected version"
}
```

**Response (invalid):**
```json
{
  "chain": "eth",
  "valid": false,
  "checksummed": null,
  "error": "Not a valid Ethereum address format (must be 0x + 40 hex chars)"
}
```

---

### GET `/api/wallets/search`
Search public wallets by username or chain. No auth required.

**Query params:**
- `username` (optional) — partial match, case-insensitive
- `chain` (optional) — `eth` or `sol`

**Example:** `GET /api/wallets/search?username=satoshi&chain=eth`

**Response:** Array of up to 50 matching public wallet objects.

---

## Crypto Endpoints

### POST `/api/ethereum/generate`
Generate a new Ethereum wallet from scratch. No auth required.

**Request:** No body needed.

**Response:**
```json
{
  "mnemonic": "apple mango river ocean ...",
  "private_key": "0xa3f8c2d1...",
  "public_key": "04b3c8f2...",
  "address": "0xAb5801a7D398351b...",
  "derivation_path": "m/44'/60'/0'/0/0",
  "steps": [
    { "step": 1, "name": "Generate Entropy", "detail": "...", "output": "a3f8..." },
    { "step": 2, "name": "BIP-39 Mnemonic",  "detail": "...", "output": "apple mango..." },
    { "step": 3, "name": "PBKDF2-HMAC-SHA512", "detail": "...", "output": "seed_hex" },
    { "step": 4, "name": "BIP-32 HD Derivation", "detail": "...", "output": "private_key_hex" },
    { "step": 5, "name": "secp256k1 EC Multiply", "detail": "...", "output": "public_key_hex" },
    { "step": 6, "name": "Keccak-256 Hash", "detail": "...", "output": "hash_hex" },
    { "step": 7, "name": "Address Extraction + EIP-55 Checksum", "detail": "...", "output": "0xAddress" }
  ]
}
```

---

### POST `/api/ethereum/sign`
Sign an Ethereum transaction locally (does not broadcast — use `/api/chain/broadcast` to send it).

**Request body:**
```json
{
  "private_key": "0xa3f8c2d1...",
  "to": "0x0000000000000000000000000000000000000000",
  "value_eth": 0.01,
  "gas_limit": 21000,
  "gas_price_gwei": 20,
  "nonce": 0,
  "chain_id": 11155111
}
```

**Note on chain_id:**
- `1` = Ethereum Mainnet (real money — don't use this)
- `11155111` = Sepolia Testnet (use this for testing)

**Response:**
```json
{
  "raw_transaction": "0xf86c...",
  "transaction_hash": "0xabc...",
  "from_address": "0xYourAddress",
  "signature": { "r": "0x...", "s": "0x...", "v": 37 },
  "steps": [ ...5 steps... ]
}
```

Copy `raw_transaction` and paste it into the Testnet page → Broadcast section to send it to Sepolia.

---

### POST `/api/solana/generate`
Generate a new Solana wallet from scratch.

**Response:**
```json
{
  "mnemonic": "apple mango river ...",
  "private_key_hex": "a3f8c2d1...",
  "public_key_hex": "b7e94f20...",
  "public_key_base58": "7xKXtg2CW87d97TX...",
  "secret_key_b64": "base64string==",
  "derivation_path": "m/44'/501'/0'/0'",
  "steps": [ ...6 steps... ]
}
```

---

### POST `/api/solana/sign`
Sign a simulated Solana transfer.

**Request body:**
```json
{
  "private_key_hex": "a3f8c2d1...",
  "recipient": "7xKXtg2CW87d97TX...",
  "lamports": 1000000
}
```

**Response:**
```json
{
  "sender": "YourSolanaAddress",
  "recipient": "RecipientAddress",
  "lamports": 1000000,
  "message_hex": "...",
  "message_text": "Transfer 1000000 lamports from ... to ...",
  "signature_hex": "64-byte-hex",
  "signature_base58": "base58-sig",
  "signature_base64": "base64-sig",
  "is_deterministic": true,
  "signature_verified": true,
  "steps": [ ...3 steps... ]
}
```

---

### GET `/api/crypto/compare`
Returns static comparison data for ECDSA, Ed25519, and BLS. Used by the `/visualize` page. No auth required.

---

## Sepolia Chain Endpoints

These endpoints connect to the real Ethereum Sepolia testnet via Alchemy. No auth required.

### GET `/api/chain/balance/{address}`
Get the Sepolia ETH balance of any Ethereum address.

**Example:** `GET /api/chain/balance/0xAb5801a7D398351b...`

**Response:**
```json
{
  "address": "0xAb5801a7D398351b...",
  "balance_wei": 1000000000000000,
  "balance_eth": 0.001,
  "network": "Sepolia Testnet",
  "chain_id": 11155111,
  "etherscan_url": "https://sepolia.etherscan.io/address/0xAb5801a7D398351b..."
}
```

---

### GET `/api/chain/nonce/{address}`
Get the current transaction count (nonce) for an address. You need this when building transactions manually.

**Response:**
```json
{
  "address": "0xAb5801a7D398351b...",
  "nonce": 3
}
```

---

### GET `/api/chain/gas-price`
Get the current Sepolia network gas price.

**Response:**
```json
{
  "gas_price_wei": 1000000000,
  "gas_price_gwei": 1.0,
  "network": "Sepolia Testnet"
}
```

---

### POST `/api/chain/broadcast`
Send a signed raw transaction to Sepolia. The transaction must already be signed (use `/api/ethereum/sign` to sign it first).

**Request body:**
```json
{
  "raw_tx": "0xf86c..."
}
```

**Response:**
```json
{
  "tx_hash": "0xabc123...",
  "status": "broadcast",
  "etherscan_url": "https://sepolia.etherscan.io/tx/0xabc123..."
}
```

**Errors:** `400` if the transaction is malformed, has wrong nonce, insufficient gas, etc.

---

### GET `/api/chain/tx/{tx_hash}`
Check the status of a transaction — whether it has been mined.

**Example:** `GET /api/chain/tx/0xabc123...`

**Response (pending):**
```json
{
  "tx_hash": "0xabc123...",
  "status": "pending",
  "block_number": null,
  "gas_used": null
}
```

**Response (mined):**
```json
{
  "tx_hash": "0xabc123...",
  "status": "success",
  "block_number": 5823491,
  "gas_used": 21000,
  "etherscan_url": "https://sepolia.etherscan.io/tx/0xabc123..."
}
```

---

## Counter Contract Endpoints

These endpoints interact with the Counter smart contract deployed on Sepolia. The contract address must be set in `.env` as `COUNTER_CONTRACT_ADDRESS`. If it's not set, endpoints return a `503` with a message explaining how to deploy.

### GET `/api/counter/value`
Read the current counter value from the blockchain. No transaction required — this is a free read.

**Response:**
```json
{
  "count": 42,
  "contract_address": "0xDeployedAddress...",
  "owner": "0xDeployerAddress...",
  "network": "Sepolia Testnet",
  "etherscan_url": "https://sepolia.etherscan.io/address/0xDeployedAddress..."
}
```

---

### POST `/api/counter/increment`
Sign and broadcast an `increment()` call to the Counter contract. This costs a small amount of Sepolia ETH for gas.

**Request body:**
```json
{
  "private_key": "0xa3f8c2d1..."
}
```

**Response:**
```json
{
  "tx_hash": "0xabc123...",
  "from_address": "0xYourAddress...",
  "contract_address": "0xDeployedAddress...",
  "nonce": 5,
  "gas_price_gwei": 1.5,
  "status": "broadcast",
  "etherscan_url": "https://sepolia.etherscan.io/tx/0xabc123..."
}
```

**Errors:** `503` if contract not deployed; `400` if private key is invalid or insufficient gas.

---

### POST `/api/counter/reset`
Sign and broadcast a `reset()` call. Only the wallet that originally deployed the contract can call this — everyone else gets a revert from the contract.

**Request body:**
```json
{
  "private_key": "0xa3f8c2d1..."
}
```

**Response:** Same shape as `/increment`.

**Errors:** `400` if the sender is not the contract owner (contract will revert).

---

## Testing without the frontend

Go to **http://localhost:8000/docs** — Swagger UI lets you call any endpoint interactively:
1. Click an endpoint → **Try it out** → fill in the body → **Execute**
2. For protected endpoints: click **Authorize** (top right) → paste your token → **Authorize**
