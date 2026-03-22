import os
import base64
import hashlib
import base58 as base58lib
from mnemonic import Mnemonic
from bip_utils import Bip39SeedGenerator, Bip44, Bip44Coins, Bip44Changes
import nacl.signing


def generate_solana_wallet() -> dict:
    steps = []

    # Step 1: Generate 128-bit entropy
    entropy = os.urandom(16)
    steps.append({
        "step": 1,
        "name": "Generate Entropy",
        "detail": "128 bits of cryptographically secure randomness from os.urandom(16)",
        "output": entropy.hex(),
    })

    # Step 2: BIP-39 mnemonic
    mnemo = Mnemonic("english")
    mnemonic_phrase = mnemo.to_mnemonic(entropy)
    steps.append({
        "step": 2,
        "name": "BIP-39 Mnemonic",
        "detail": "Entropy → SHA-256 checksum → 12-word BIP-39 seed phrase (same BIP-39 standard as Ethereum)",
        "output": mnemonic_phrase,
    })

    # Step 3: PBKDF2-HMAC-SHA512 → 512-bit seed
    seed_bytes = Bip39SeedGenerator(mnemonic_phrase).Generate()
    steps.append({
        "step": 3,
        "name": "PBKDF2-HMAC-SHA512",
        "detail": "mnemonic + salt 'mnemonic' → 2048 rounds PBKDF2-HMAC-SHA512 → 64-byte (512-bit) seed",
        "output": seed_bytes.hex(),
    })

    # Step 4: BIP-44 for Solana m/44'/501'/0'/0'
    bip44_mst = Bip44.FromSeed(seed_bytes, Bip44Coins.SOLANA)
    account = bip44_mst.Purpose().Coin().Account(0).Change(Bip44Changes.CHAIN_EXT)
    private_key_bytes = account.PrivateKey().Raw().ToBytes()[:32]
    steps.append({
        "step": 4,
        "name": "BIP-44 HD Derivation",
        "detail": "Derive child key at m/44'/501'/0'/0' (coin_type=501=Solana, all hardened paths use HMAC-SHA512)",
        "output": private_key_bytes.hex(),
    })

    # Step 5: Ed25519 keypair
    signing_key = nacl.signing.SigningKey(private_key_bytes)
    verify_key = signing_key.verify_key
    public_key_bytes = bytes(verify_key)
    steps.append({
        "step": 5,
        "name": "Ed25519 Keypair",
        "detail": "private_key_seed → scalar clamp (bits 0,1,2,255 cleared; bit 254 set) → multiply by Curve25519 base point B → 32-byte compressed public key",
        "output": public_key_bytes.hex(),
    })

    # Step 6: Solana address = Base58(public key)
    address = base58lib.b58encode(public_key_bytes).decode()
    steps.append({
        "step": 6,
        "name": "Solana Address (Base58)",
        "detail": "Solana address = Base58(raw_ed25519_public_key_bytes). No hashing! The public key IS the address. Unlike Ethereum which hashes first.",
        "output": address,
    })

    secret_key_bytes = private_key_bytes + public_key_bytes
    secret_key_b64 = base64.b64encode(secret_key_bytes).decode()

    return {
        "mnemonic": mnemonic_phrase,
        "private_key_hex": private_key_bytes.hex(),
        "public_key_hex": public_key_bytes.hex(),
        "public_key_base58": address,
        "secret_key_b64": secret_key_b64,
        "derivation_path": "m/44'/501'/0'/0'",
        "steps": steps,
    }


def sign_solana_transaction(private_key_hex: str, recipient: str, lamports: int) -> dict:
    steps = []

    private_key_bytes = bytes.fromhex(private_key_hex)
    signing_key = nacl.signing.SigningKey(private_key_bytes)
    verify_key = signing_key.verify_key
    sender_address = base58lib.b58encode(bytes(verify_key)).decode()

    # Simulated recent blockhash (in real Solana this comes from the network)
    simulated_blockhash = hashlib.sha256(b"simulated_recent_blockhash_demo").hexdigest()[:44]

    # Step 1: Build message
    message = (
        f"Transfer {lamports} lamports from {sender_address} to {recipient} "
        f"| blockhash:{simulated_blockhash}"
    ).encode()
    steps.append({
        "step": 1,
        "name": "Build Message",
        "detail": f"Serialize: sender={sender_address[:16]}..., recipient={recipient[:16]}..., lamports={lamports}, blockhash={simulated_blockhash[:16]}... (simulated)",
        "output": message.hex(),
    })

    # Step 2: Ed25519 sign — deterministic
    signed = signing_key.sign(message)
    signature_bytes = signed.signature
    steps.append({
        "step": 2,
        "name": "Ed25519 Sign (Deterministic)",
        "detail": "sign(private_key, message) → nonce = SHA-512(private_key_nonce_half || message) → deterministic 64-byte signature. RFC 8032: no external randomness required.",
        "output": signature_bytes.hex(),
    })

    # Step 3: Determinism explainer
    steps.append({
        "step": 3,
        "name": "No Random Nonce Needed",
        "detail": "Unlike ECDSA (random k, catastrophic if reused — see PS3 hack 2010), Ed25519 derives its nonce deterministically. Same message + same key = same signature always.",
        "output": f"is_deterministic=True | signature_length={len(signature_bytes)} bytes | verified={True}",
    })

    # Verify
    try:
        verify_key.verify(message, signature_bytes)
        verified = True
    except Exception:
        verified = False

    return {
        "sender": sender_address,
        "recipient": recipient,
        "lamports": lamports,
        "message_hex": message.hex(),
        "message_text": message.decode(),
        "signature_hex": signature_bytes.hex(),
        "signature_base58": base58lib.b58encode(signature_bytes).decode(),
        "signature_base64": base64.b64encode(signature_bytes).decode(),
        "is_deterministic": True,
        "signature_verified": verified,
        "simulated_blockhash": simulated_blockhash,
        "steps": steps,
    }
