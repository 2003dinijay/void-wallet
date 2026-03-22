import os
from eth_account import Account
from eth_keys import keys
from eth_utils import to_checksum_address
from mnemonic import Mnemonic
from bip_utils import Bip39SeedGenerator, Bip44, Bip44Coins, Bip44Changes
from Crypto.Hash import keccak as _keccak

Account.enable_unaudited_hdwallet_features()


def _keccak256(data: bytes) -> str:
    k = _keccak.new(digest_bits=256)
    k.update(data)
    return k.hexdigest()


def generate_ethereum_wallet() -> dict:
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
        "detail": "Entropy → SHA-256 checksum (4 bits) appended → split into 11-bit groups → map to 2048-word BIP-39 wordlist → 12 words",
        "output": mnemonic_phrase,
    })

    # Step 3: PBKDF2-HMAC-SHA512 → 512-bit seed
    seed_bytes = Bip39SeedGenerator(mnemonic_phrase).Generate()
    steps.append({
        "step": 3,
        "name": "PBKDF2-HMAC-SHA512",
        "detail": "mnemonic + salt 'mnemonic' → 2048 rounds of PBKDF2-HMAC-SHA512 → 512-bit (64-byte) seed",
        "output": seed_bytes.hex(),
    })

    # Step 4: BIP-32/44 HD derivation m/44'/60'/0'/0/0
    bip44_mst_ctx = Bip44.FromSeed(seed_bytes, Bip44Coins.ETHEREUM)
    bip44_acc_ctx = (
        bip44_mst_ctx
        .Purpose()
        .Coin()
        .Account(0)
        .Change(Bip44Changes.CHAIN_EXT)
        .AddressIndex(0)
    )
    private_key_bytes = bip44_acc_ctx.PrivateKey().Raw().ToBytes()
    steps.append({
        "step": 4,
        "name": "BIP-32 HD Derivation",
        "detail": "Seed → BIP-32 master key → derive child at m/44'/60'/0'/0/0 using HMAC-SHA512 at each level",
        "output": private_key_bytes.hex(),
    })

    # Step 5: secp256k1 EC multiply → uncompressed public key
    pk = keys.PrivateKey(private_key_bytes)
    public_key = pk.public_key
    raw_64 = public_key.to_bytes()           # 64-byte X||Y
    public_key_hex = "04" + raw_64.hex()     # uncompressed form
    steps.append({
        "step": 5,
        "name": "secp256k1 EC Multiply",
        "detail": "private_key × G (secp256k1 generator point) → 512-bit uncompressed public key (0x04 prefix + 64 bytes X||Y)",
        "output": public_key_hex,
    })

    # Step 6: Keccak-256 of the 64-byte raw public key
    keccak_hash = _keccak256(raw_64)
    steps.append({
        "step": 6,
        "name": "Keccak-256 Hash",
        "detail": "Keccak-256(public_key_bytes[64]) → 32-byte hash. NOTE: Ethereum uses original Keccak — NOT NIST SHA3-256.",
        "output": keccak_hash,
    })

    # Step 7: Last 20 bytes → EIP-55 checksum address
    address_hex = keccak_hash[-40:]
    checksum_hash = _keccak256(address_hex.encode("ascii"))
    checksum_address = "0x" + "".join(
        c.upper() if int(checksum_hash[i], 16) >= 8 else c
        for i, c in enumerate(address_hex)
    )
    steps.append({
        "step": 7,
        "name": "Address Extraction + EIP-55 Checksum",
        "detail": "Take last 20 bytes (40 hex chars) of Keccak hash → apply EIP-55 mixed-case checksum for typo detection",
        "output": checksum_address,
    })

    return {
        "mnemonic": mnemonic_phrase,
        "private_key": "0x" + private_key_bytes.hex(),
        "public_key": public_key_hex,
        "address": checksum_address,
        "derivation_path": "m/44'/60'/0'/0/0",
        "steps": steps,
    }


def sign_ethereum_transaction(
    private_key: str,
    to: str,
    value_eth: float,
    gas_limit: int,
    gas_price_gwei: float,
    nonce: int,
    chain_id: int,
) -> dict:
    steps = []

    value_wei = int(value_eth * 1e18)
    gas_price_wei = int(gas_price_gwei * 1e9)

    # Normalize address — accept any case, convert to valid EIP-55 checksum
    to = to_checksum_address(to.lower())

    tx_dict = {
        "nonce": nonce,
        "gasPrice": gas_price_wei,
        "gas": gas_limit,
        "to": to,
        "value": value_wei,
        "data": b"",
        "chainId": chain_id,
    }
    steps.append({
        "step": 1,
        "name": "Build Transaction",
        "detail": f"Construct EIP-155 tx: nonce={nonce}, gasPrice={gas_price_wei} wei, gas={gas_limit}, to={to}, value={value_wei} wei, chainId={chain_id}",
        "output": f"nonce={nonce} | gasPrice={gas_price_wei} | gas={gas_limit} | value={value_wei} wei | chainId={chain_id}",
    })

    account = Account.from_key(private_key)
    signed_tx = Account.sign_transaction(tx_dict, private_key)
    rlp_hex = signed_tx.raw_transaction.hex()
    steps.append({
        "step": 2,
        "name": "RLP Encode",
        "detail": "Recursive Length Prefix (RLP) encode [nonce, gasPrice, gasLimit, to, value, data, chainId, 0, 0] — EIP-155 signing payload",
        "output": rlp_hex[:80] + "...",
    })

    tx_hash = signed_tx.hash.hex()
    steps.append({
        "step": 3,
        "name": "Keccak-256 Hash",
        "detail": "Keccak-256(RLP_encoded_tx) → 32-byte transaction hash — the ECDSA message digest",
        "output": tx_hash,
    })

    r = hex(signed_tx.r)
    s = hex(signed_tx.s)
    v = signed_tx.v
    steps.append({
        "step": 4,
        "name": "ECDSA Sign (secp256k1)",
        "detail": "sign(private_key, tx_hash) → probabilistic signature (random k) → (r, s) pair + recovery bit v",
        "output": f"r={r[:18]}... | s={s[:18]}... | v={v}",
    })

    v_base = v - chain_id * 2 - 35
    steps.append({
        "step": 5,
        "name": "EIP-155 Replay Protection",
        "detail": f"v = recovery_bit + chainId×2 + 35 = {v_base} + {chain_id}×2 + 35 = {v}. Prevents replaying this tx on other chains.",
        "output": f"v = {v} (chainId={chain_id}, recovery_bit={v_base})",
    })

    return {
        "raw_transaction": rlp_hex,
        "transaction_hash": tx_hash,
        "from_address": account.address,
        "signature": {"r": r, "s": s, "v": v},
        "steps": steps,
    }
