# How the Cryptography Works (Simple Explanation)

This page explains the crypto concepts the app demonstrates. No maths degree needed.

---

## The Big Picture: How a Wallet Address is Created

Imagine you want to create a Gmail account but instead of choosing a username, the username is **mathematically generated from a randomly chosen password**. That's essentially what a crypto wallet does.

```
Random Secret Number  →  [MATH]  →  Public Address
   (private key)                      (wallet address)
```

The math is a **one-way function** — you can go forward easily, but you cannot reverse it. Knowing the address does NOT let anyone figure out the private key. This is the foundation of all blockchain security.

---

## Step by Step: Ethereum Wallet Creation

### Step 1 — Entropy (Randomness)
The computer generates **128 bits of pure randomness**. This is like rolling a die 128 times.

```
os.urandom(16)  →  a3f8c2d1...  (16 random bytes = 128 bits)
```

Why 128 bits? There are 2¹²⁸ possible values — that's more than the number of atoms in the observable universe. Nobody can guess it.

---

### Step 2 — BIP-39 Mnemonic (12 Words)
Those 128 random bits are converted into **12 English words** (called a seed phrase or mnemonic).

```
a3f8c2d1...  →  "apple mango ocean river glass sunset ..."
```

Why words? Because humans are terrible at writing down `a3f8c2d1b7e94f20...` accurately. Words are easier to write and read back.

The 12 words contain ALL the information needed to recreate your wallet. **Anyone who gets your 12 words owns your wallet.**

---

### Step 3 — Seed (PBKDF2-HMAC-SHA512)
The 12 words are fed through a slow hashing process called PBKDF2 that runs SHA-512 **2048 times** in a loop.

```
12 words  →  [SHA-512 × 2048]  →  64-byte seed (512 bits)
```

Why so many rounds? To make brute-force attacks slow. If someone tries to guess your words, each guess takes 2048× longer.

---

### Step 4 — BIP-32 Derivation (HD Wallet)
The 64-byte seed is used to derive a specific private key by following a **path**.

```
seed  →  m/44'/60'/0'/0/0  →  private key
```

Think of the path like a folder structure: `m` is the root, `44'` means "BIP-44 standard", `60'` means "Ethereum coin", `0'/0/0` means "first account, first address".

This lets one seed phrase create **millions of different keys** — one for each path. MetaMask does this, which is why one seed phrase controls all your accounts.

---

### Step 5 — secp256k1 (The Actual Math)
The private key is multiplied by a special point called **G** (the generator point) on an elliptic curve called secp256k1.

```
private_key × G  =  public_key
```

This is **elliptic curve multiplication**. It's easy to do forward, impossible to reverse (that's called the Elliptic Curve Discrete Logarithm Problem — the math is unsolved and considered unbreakable).

The result is a public key: a point on the curve described by two 256-bit numbers (X and Y coordinates).

---

### Step 6 — Keccak-256 (Hashing the Public Key)
The public key is fed through the **Keccak-256** hash function.

```
public_key (64 bytes)  →  [Keccak-256]  →  32-byte hash
```

Important: Ethereum uses the **original Keccak** algorithm, NOT the official SHA3-256 standard. They differ slightly because Ethereum was built before the NIST standard was finalized.

---

### Step 7 — Ethereum Address (Last 20 Bytes)
Take only the **last 20 bytes** (40 hex characters) of the hash. That's your Ethereum address.

```
hash: 4d2a3f...8b1c9e7a2f3d
address: 0x8b1c9e7a2f3d...  (last 20 bytes only, with 0x prefix)
```

Then apply **EIP-55 checksum**: mix uppercase and lowercase letters so that if you mistype the address, the app can detect the error.

---

## Solana is Different

Solana skips several steps:

| | Ethereum | Solana |
|---|---|---|
| Curve | secp256k1 | Curve25519 (Ed25519) |
| Hashing the public key? | Yes (Keccak-256) | **No** |
| Address format | Hex with 0x prefix | Base58 |
| Address is | Hash of public key | **Raw public key** |

Solana's address IS the public key, just encoded in Base58. No hashing step. Simpler, but it means your public key is always exposed.

---

## Transaction Signing

When you send crypto, you **sign** the transaction with your private key. This proves you authorized it without revealing your private key.

### Ethereum (ECDSA)
```
sign(private_key, transaction_hash)  →  signature (r, s, v)
```
- `r` and `s` are two 256-bit numbers that form the signature
- `v` is a recovery bit (plus the chain ID for EIP-155 replay protection)
- The signature is **different every time** (uses a random number `k` internally)

### Solana (Ed25519)
```
sign(private_key, message)  →  signature (64 bytes)
```
- The signature is **always the same** for the same input (deterministic)
- No random number needed — the nonce is derived from the private key + message
- This eliminates an entire class of attacks (the k-reuse attack that hacked PlayStation 3 in 2010)

---

## Why Does Any of This Matter?

| Concept | Why it matters |
|---|---|
| One-way functions | You can share your public address safely — nobody can reverse-engineer your private key |
| Deterministic derivation | One 12-word phrase → infinite addresses, all recoverable |
| Digital signatures | Proves you authorized a transaction without revealing your secret |
| Keccak-256 | A small change in input completely scrambles the output (avalanche effect) |
| Ed25519 determinism | Eliminates the risk of a "bad random number" leaking your private key |
