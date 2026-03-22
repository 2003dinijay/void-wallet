from fastapi import APIRouter

router = APIRouter()


@router.get("/compare")
def crypto_compare():
    return {
        "algorithms": [
            {
                "name": "ECDSA (secp256k1)",
                "used_by": "Ethereum, Bitcoin",
                "curve": "secp256k1 (y² = x³ + 7 over Fp)",
                "key_size_bits": 256,
                "signature_size_bytes": 64,
                "deterministic": False,
                "pros": [
                    "Widely adopted (Bitcoin, Ethereum)",
                    "Hardware wallet support",
                    "EIP-155 replay protection",
                ],
                "cons": [
                    "Non-deterministic (random k required)",
                    "Private key leak if k reused (PS3 hack 2010)",
                    "Slower verification than Ed25519",
                ],
                "hash_function": "Keccak-256",
                "address_derivation": "Keccak-256(public_key)[-20 bytes] + EIP-55 checksum",
            },
            {
                "name": "Ed25519 (EdDSA)",
                "used_by": "Solana, Cardano, Polkadot",
                "curve": "Twisted Edwards curve (Curve25519): -x² + y² = 1 + dx²y²",
                "key_size_bits": 255,
                "signature_size_bytes": 64,
                "deterministic": True,
                "pros": [
                    "Fully deterministic signatures",
                    "Fast verification (batch-verifiable)",
                    "Resistant to side-channel attacks",
                    "No random nonce — no k-reuse risk",
                ],
                "cons": [
                    "Less legacy hardware wallet support",
                    "Solana uses raw pubkey as address (no hashing)",
                ],
                "hash_function": "SHA-512 (internal to Ed25519)",
                "address_derivation": "Base58(ed25519_public_key) — no hashing",
            },
            {
                "name": "BLS12-381 (BLS Signatures)",
                "used_by": "Ethereum 2.0 (consensus), Filecoin, Zcash",
                "curve": "BLS12-381 pairing-friendly curve",
                "key_size_bits": 381,
                "signature_size_bytes": 48,
                "deterministic": True,
                "pros": [
                    "Signature aggregation (N sigs → 1 sig)",
                    "Threshold signatures natively supported",
                    "Shorter signatures than ECDSA",
                    "Powers Ethereum validator attestations",
                ],
                "cons": [
                    "Slower individual sign/verify",
                    "Pairing operations are expensive",
                    "More complex implementation",
                ],
                "hash_function": "SHA-256 + hash-to-curve",
                "address_derivation": "Validator keys only — not wallet addresses",
            },
        ],
        "key_derivation_pipeline": {
            "bip39": {
                "name": "BIP-39 Mnemonic",
                "input": "128–256 bits of entropy",
                "output": "12–24 word seed phrase",
                "algorithm": "entropy → SHA-256 checksum → 11-bit groups → wordlist lookup",
            },
            "pbkdf2": {
                "name": "PBKDF2-HMAC-SHA512",
                "input": "mnemonic phrase + salt ('mnemonic' + optional passphrase)",
                "output": "512-bit (64-byte) seed",
                "rounds": 2048,
            },
            "bip32": {
                "name": "BIP-32 HD Derivation",
                "input": "512-bit seed",
                "output": "hierarchy of child private keys",
                "algorithm": "HMAC-SHA512 with hardened/non-hardened child derivation",
            },
            "bip44": {
                "name": "BIP-44 Coin Path",
                "ethereum_path": "m/44'/60'/0'/0/0",
                "solana_path": "m/44'/501'/0'/0'",
                "format": "m / purpose' / coin_type' / account' / change / address_index",
            },
        },
        "zkp_explainer": {
            "name": "Zero-Knowledge Proofs (ZKP)",
            "concept": "Prove you know a secret without revealing the secret itself — the verifier learns nothing except that the proof is valid.",
            "blockchain_use": "Privacy-preserving transactions (Zcash, zkSync, StarkNet, Tornado Cash)",
            "groth16": {
                "name": "Groth16",
                "type": "zk-SNARK (Succinct Non-interactive ARgument of Knowledge)",
                "setup": "Trusted setup required (toxic waste ceremony)",
                "proof_size": "~200 bytes (constant regardless of circuit size)",
                "verification_time": "O(1) — very fast",
                "steps": [
                    "1. Arithmetic circuit: encode the computation as logic gates",
                    "2. R1CS: convert to Rank-1 Constraint System (A·w ∘ B·w = C·w)",
                    "3. QAP: convert to Quadratic Arithmetic Program over a polynomial field",
                    "4. Trusted setup: generate proving key (pk) and verification key (vk)",
                    "5. Prover: compute π = (A, B, C) using witness (private inputs)",
                    "6. Verifier: check e(A,B) = e(α,β) · e(∑vk_i·input_i, γ) · e(C,δ)",
                ],
            },
        },
    }
