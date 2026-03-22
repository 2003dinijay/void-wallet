'use client'

interface Props {
  chain: 'eth' | 'sol'
}

const ETH_STEPS = [
  {
    title: 'Entropy',
    body: '128 bits from os.urandom() — the operating system CSPRNG. Never use Math.random() for cryptography.',
  },
  {
    title: 'BIP-39 Mnemonic',
    body: 'SHA-256 checksum (4 bits) appended to entropy, split into 11-bit groups, each mapped to one of 2048 BIP-39 words.',
  },
  {
    title: 'PBKDF2-HMAC-SHA512',
    body: 'mnemonic + salt ("mnemonic") → 2048 rounds of PBKDF2-HMAC-SHA512 → 512-bit seed. Slow by design to resist brute force.',
  },
  {
    title: "BIP-32 HD Derivation (m/44'/60'/0'/0/0)",
    body: "HMAC-SHA512(parent_key ‖ child_index) splits into left 256 bits (child key addend) + right 256 bits (new chain code). Hardened paths (') prevent parent key derivation from child public key.",
  },
  {
    title: 'secp256k1',
    body: 'Elliptic curve y² = x³ + 7 over a 256-bit prime field. private_key × G = public_key. One-way via ECDLP hardness assumption.',
  },
  {
    title: 'Keccak-256',
    body: 'Ethereum uses the ORIGINAL Keccak (pre-NIST standardization). SHA3-256 (the NIST standard) produces different output. Ethereum standardized on Keccak before FIPS 202 was published.',
  },
  {
    title: 'EIP-55 Checksum',
    body: "Mixed-case hex encoding: each letter's case is determined by the corresponding nibble of keccak256(lowercase_address). Typos in the address will fail checksum verification.",
  },
]

const SOL_STEPS = [
  {
    title: 'Entropy',
    body: '128 bits from os.urandom() — same as Ethereum. Good entropy is the root of all cryptographic security.',
  },
  {
    title: 'BIP-39 Mnemonic',
    body: 'Same BIP-39 process. 12 words encode 128 bits of entropy + 4-bit checksum. The BIP-39 wordlist is chain-agnostic.',
  },
  {
    title: 'PBKDF2-HMAC-SHA512',
    body: "Identical to Ethereum. The mnemonic → seed derivation is blockchain-agnostic — it's the coin_type in BIP-44 that differentiates chains.",
  },
  {
    title: "BIP-44 Path (m/44'/501'/0'/0')",
    body: "Coin type 501 = Solana. All four path components are hardened ('), preventing parent key derivation from child keys — stronger security than Ethereum's mixed path.",
  },
  {
    title: 'Ed25519 Keypair',
    body: 'Private key seed → scalar clamp (clear bits 0,1,2,255; set bit 254) → multiply by Curve25519 base point B → 32-byte compressed public key (Edwards curve).',
  },
  {
    title: 'Base58 Address',
    body: "Solana address = Base58(raw_public_key_bytes). No hashing! The public key IS the address. This is simpler than Ethereum but means the address reveals your public key.",
  },
]

export default function CryptoExplainer({ chain }: Props) {
  const steps = chain === 'eth' ? ETH_STEPS : SOL_STEPS
  const accent = chain === 'eth' ? 'text-eth-green' : 'text-sol-purple'
  const border = chain === 'eth' ? 'border-eth-green/20' : 'border-sol-purple/20'

  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <div key={step.title} className={`border-l-2 ${border} pl-4 space-y-1`}>
          <h4 className={`font-mono text-sm font-bold ${accent}`}>
            {String(i + 1).padStart(2, '0')}. {step.title}
          </h4>
          <p className="text-void-muted text-xs leading-relaxed">{step.body}</p>
        </div>
      ))}
    </div>
  )
}
