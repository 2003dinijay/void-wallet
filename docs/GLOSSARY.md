# Glossary — Terms Explained Simply

Every technical term you'll encounter in this project, explained without assuming prior knowledge.

---

## Auth & Security Terms

**JWT (JSON Web Token)**
A compact, self-contained token used to prove you're logged in. After you log in, the server gives you a JWT. You send it with every subsequent request in the `Authorization: Bearer <token>` header. The server can verify it without touching the database — it's like a signed ticket.

**bcrypt**
A password hashing function. When you register, your password is fed through bcrypt (which runs a slow hashing algorithm ~12 rounds deep) and the result is stored. When you log in, your entered password is hashed again and compared. The original password is never stored — only the hash.

**Hash (password context)**
A one-way mathematical transformation. You can turn a password into a hash, but you cannot reverse a hash back into a password. This is why even if the database is leaked, attacker can't get your password directly.

**Salt (bcrypt)**
A random value mixed into the password before hashing. Ensures two users with the same password get different hashes. Prevents rainbow table attacks.

**Token expiry**
JWTs have an expiry time. In this project it's 1440 minutes (24 hours). After that, you need to log in again.

---

## Wallet Terms

**Private Key**
A secret 256-bit number. Think of it as the master password to your wallet. Whoever has it controls all the funds. In this app it is shown blurred and **never stored in the database**.

**Public Key**
Derived mathematically from the private key. You can share this freely. It is used to verify signatures. Like your name on an envelope — anyone can see it, but only you can sign the letter inside.

**Wallet Address**
A shorter, more shareable version of the public key. What you give people when you want to receive crypto. For Ethereum it's 42 characters starting with `0x`. For Solana it's a 32–44 character Base58 string.

**Seed Phrase / Mnemonic**
12 (or 24) English words that encode your private key. If you lose your wallet, these words can restore it. If someone else gets them, they own your wallet. **Never stored in the database.**

**HD Wallet (Hierarchical Deterministic)**
A wallet where one seed phrase generates millions of different addresses, each at a different "derivation path". MetaMask is an HD wallet. BIP-32 and BIP-44 define how this works.

---

## Cryptography Terms

**Hash Function**
A mathematical function that takes any input and produces a fixed-size output (the "hash"). Same input always gives same output. One-way — you can't reverse it. A small change to the input completely scrambles the output (avalanche effect).

**Keccak-256**
The hash function Ethereum uses. Produces a 256-bit (32-byte) output. NOT the same as SHA3-256 even though they're related — Ethereum standardised before NIST finalised SHA-3.

**SHA-512**
A hash function that produces 512-bit output. Used internally in BIP-32 and BIP-39 seed derivation.

**PBKDF2**
"Password-Based Key Derivation Function 2". Takes a mnemonic phrase and runs SHA-512 through it 2048 times in a loop to produce a 512-bit seed. The many rounds make brute-force attacks slow.

**Elliptic Curve Cryptography (ECC)**
Public-key cryptography based on the math of elliptic curves. Produces smaller, faster keys than older systems like RSA. Both Ethereum and Solana use ECC, just different curves.

**secp256k1**
The elliptic curve used by Ethereum and Bitcoin. Equation: `y² = x³ + 7`. The private key is a random number; the public key is a point on this curve.

**Curve25519 / Ed25519**
The elliptic curve used by Solana. Designed by Daniel Bernstein. Faster and more secure against certain attacks than secp256k1.

**ECDSA (Elliptic Curve Digital Signature Algorithm)**
The signing algorithm used by Ethereum. Requires a random number `k` per signature — if `k` is ever reused, the private key is exposed (the PS3 hack, 2010).

**EdDSA / Ed25519**
The signing algorithm used by Solana. **Deterministic** — no random number needed. Same message + same key = same signature every time. Eliminates the k-reuse attack.

**Deterministic Signature**
A signature where the same inputs always produce the same output. Ed25519 is deterministic. ECDSA is not.

**RLP (Recursive Length Prefix)**
Ethereum's binary encoding format for transaction data before hashing.

**EIP-155**
Ethereum Improvement Proposal #155. Adds the chain ID into signed transaction data to prevent replay attacks across chains.

**EIP-55**
Ethereum Improvement Proposal #55. A checksum scheme using mixed-case hex for Ethereum addresses to help detect typos.

---

## Standards / Protocols

**BIP-39**
Bitcoin Improvement Proposal #39. Defines the 12-word mnemonic phrase standard. All major wallets follow it — you can restore a MetaMask wallet in Trust Wallet using the same seed phrase.

**BIP-32**
Bitcoin Improvement Proposal #32. Defines how to derive a tree of child keys from a single seed using HMAC-SHA512.

**BIP-44**
Bitcoin Improvement Proposal #44. Defines the derivation path format: `m / purpose' / coin_type' / account' / change / address_index`. Coin type 60 = Ethereum, 501 = Solana.

**Base58**
An encoding format using 58 characters (excludes 0, O, I, l which look similar). Used by Solana addresses and Bitcoin.

---

## Blockchain & Smart Contract Terms

**Testnet**
A separate Ethereum network that uses fake ETH with no real value. Used for development and testing. This project uses the **Sepolia** testnet. Chain ID = 11155111.

**Mainnet**
The real Ethereum network where ETH has real monetary value. This project never connects to mainnet.

**Sepolia**
The Ethereum testnet used in this project. Chain ID 11155111. You can get free Sepolia ETH from faucets like sepoliafaucet.com to use for testing.

**Faucet**
A website that gives you free testnet ETH. You paste your address and it sends a small amount. Used to fund wallets so they can pay gas fees on testnets.

**Gas**
A fee paid to the Ethereum network to process a transaction. Measured in **Wei** (smallest unit). The more computation a transaction requires, the more gas it costs. A simple ETH transfer costs exactly 21,000 gas.

**Gas Price**
The amount of ETH you're willing to pay per unit of gas, expressed in **Gwei**. Higher gas price = faster transaction. Low gas price = transaction might sit waiting for a long time.

**Gwei**
One billionth of 1 ETH. `1 ETH = 1,000,000,000 Gwei`. Gas prices are quoted in Gwei. A typical gas price on Sepolia is 1–10 Gwei.

**Wei**
The smallest unit of ETH. `1 ETH = 10^18 Wei`. Smart contracts and the Ethereum protocol always work in Wei internally.

**Nonce**
A counter attached to every Ethereum account, starting at 0. Every time you send a transaction, the nonce increases by 1. This prevents replay attacks and ensures transactions are processed in order. If you send a transaction with nonce 5 but your account is at nonce 3, it will wait until nonces 3 and 4 are processed first.

**RPC (Remote Procedure Call)**
A way for your code to talk to a blockchain node without running the node yourself. You send a request like "what's the balance of this address?" and the node responds with the answer. Alchemy provides an RPC endpoint for Sepolia.

**Alchemy**
A blockchain infrastructure company that provides RPC endpoints. Instead of running your own Ethereum node, you connect to Alchemy's nodes via a URL like `https://eth-sepolia.g.alchemy.com/v2/<key>`. This project uses Alchemy to read data from and send transactions to Sepolia.

**Smart Contract**
A program deployed on the blockchain. Once deployed, the code is immutable and runs exactly as written — nobody can change it. Anyone can interact with it. In this project, the **Counter** contract is deployed on Sepolia.

**Solidity**
The programming language used to write Ethereum smart contracts. Compiled to EVM bytecode before deployment. Files end in `.sol`.

**ABI (Application Binary Interface)**
A JSON description of a smart contract's functions and events — the "interface" you need to call it. Like a function signature list. The backend uses the Counter ABI to know how to encode `increment()` and `getCount()` calls.

**Bytecode**
The compiled binary code of a smart contract, deployed to the blockchain. The EVM (Ethereum Virtual Machine) executes this. You don't interact with bytecode directly — you use the ABI.

**Contract Deployment**
The act of sending a special transaction (with no `to` address) containing the bytecode. The network assigns the contract a permanent address. This is a one-time process — after deployment, the contract lives at that address forever.

**Contract Address**
The permanent Ethereum address where a deployed contract lives. In this project it's stored in `.env` as `COUNTER_CONTRACT_ADDRESS`. Everyone who knows this address can interact with the contract.

**View / Read Function**
A smart contract function that only reads data — does not change any state. Costs no gas. `getCount()` is a view function.

**State-Changing Function**
A smart contract function that writes to the blockchain — changes stored values. Requires a signed transaction and costs gas. `increment()` and `reset()` are state-changing functions.

**Transaction Receipt**
A record returned after a transaction is mined, confirming it was included in a block. Contains the block number, gas used, and a `status` field (1 = success, 0 = failed).

**Etherscan**
A block explorer website for Ethereum. You can paste a transaction hash or address to see all activity. This project links directly to `https://sepolia.etherscan.io` so you can watch your transactions get mined.

**web3.py**
A Python library for interacting with Ethereum. Used in this project's backend to connect to Alchemy, read chain data, and broadcast signed transactions. Similar to the JavaScript `ethers.js` library.

---

## Zero-Knowledge Proofs

**ZKP (Zero-Knowledge Proof)**
A method to prove you know something without revealing what it is. Example: prove you're over 18 without showing your birthday.

**zk-SNARK**
"Zero-Knowledge Succinct Non-interactive ARgument of Knowledge". A compact ZKP used in blockchains (Zcash, Ethereum L2s). Constant-size proof (~200 bytes) regardless of computation complexity.

**Groth16**
A specific zk-SNARK scheme. Very fast to verify. Requires a trusted setup ceremony — if the intermediate values ("toxic waste") are kept, fake proofs can be forged.

**BLS Signatures**
"Boneh-Lynn-Shacham". Used by Ethereum 2.0 validators. Key feature: N signatures can be aggregated into one, saving enormous space on-chain.

---

## Infrastructure Terms

**FastAPI**
A Python web framework. Handles HTTP requests, validates inputs, sends JSON responses. Used for the backend.

**Uvicorn**
A fast async Python web server. Runs the FastAPI app.

**Motor**
An async Python driver for MongoDB. All database operations use `await` so they don't block the server while waiting for the database.

**Next.js**
A React framework for building websites. Handles routing, server-side rendering, etc. Used for the frontend.

**Tailwind CSS**
A CSS framework where you style elements by adding class names in JSX (e.g. `bg-void-bg text-eth-green rounded-lg`). No separate CSS files needed.

**MongoDB / MongoDB Atlas**
MongoDB is a document database (stores JSON-like objects). Atlas is the cloud-hosted version. Used to store user accounts and saved wallets.

**REST API**
A standard way for frontend and backend to communicate over HTTP. Frontend sends requests (GET, POST, DELETE), backend sends JSON responses.

**Virtual Environment (venv)**
An isolated Python installation. Keeps this project's packages separate from your system Python. Must be activated with `venv\Scripts\activate` before running the server.

**JWT (technical detail)**
JSON Web Token. Three Base64-encoded parts separated by dots: `header.payload.signature`. The server signs the payload with `JWT_SECRET`. Anyone can decode the payload (it's not encrypted), but only the server can create a valid signature.

**localStorage**
Browser storage that persists across page refreshes. Used to store the JWT token so you stay logged in. Cleared when you log out.
