import os
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

load_dotenv()

ALCHEMY_URL = os.getenv("ALCHEMY_URL", "")
CONTRACT_ADDRESS = os.getenv("COUNTER_CONTRACT_ADDRESS", "").strip()
SEPOLIA_CHAIN_ID = 11155111

# ABI matches Counter.sol exactly
COUNTER_ABI = [
    {"inputs": [], "stateMutability": "nonpayable", "type": "constructor"},
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "address", "name": "by", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "newCount", "type": "uint256"},
        ],
        "name": "Incremented",
        "type": "event",
    },
    {
        "anonymous": False,
        "inputs": [{"indexed": True, "internalType": "address", "name": "by", "type": "address"}],
        "name": "Reset",
        "type": "event",
    },
    {
        "inputs": [],
        "name": "count",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "getCount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "increment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "reset",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
]


def _require_contract():
    if not CONTRACT_ADDRESS:
        raise ValueError(
            "COUNTER_CONTRACT_ADDRESS is not set in .env. "
            "Run deploy_counter.py first to deploy the contract to Sepolia."
        )


def get_count() -> dict:
    _require_contract()
    w3 = Web3(Web3.HTTPProvider(ALCHEMY_URL))
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=COUNTER_ABI,
    )
    count = contract.functions.getCount().call()
    owner = contract.functions.owner().call()
    return {
        "count": count,
        "contract_address": CONTRACT_ADDRESS,
        "owner": owner,
        "network": "Sepolia Testnet",
        "etherscan_url": f"https://sepolia.etherscan.io/address/{CONTRACT_ADDRESS}",
    }


def increment_counter(private_key: str) -> dict:
    """Sign and broadcast an increment() call to the Counter contract."""
    _require_contract()
    w3 = Web3(Web3.HTTPProvider(ALCHEMY_URL))

    account = Account.from_key(private_key)
    sender = account.address

    contract = w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=COUNTER_ABI,
    )

    nonce = w3.eth.get_transaction_count(sender)
    gas_price = w3.eth.gas_price

    tx = contract.functions.increment().build_transaction({
        "from": sender,
        "nonce": nonce,
        "gas": 100_000,
        "gasPrice": gas_price,
        "chainId": SEPOLIA_CHAIN_ID,
    })

    signed = Account.sign_transaction(tx, private_key)
    tx_hash_bytes = w3.eth.send_raw_transaction(signed.raw_transaction)
    tx_hash_hex = "0x" + tx_hash_bytes.hex()

    return {
        "tx_hash": tx_hash_hex,
        "from_address": sender,
        "contract_address": CONTRACT_ADDRESS,
        "nonce": nonce,
        "gas_price_gwei": round(gas_price / 1e9, 4),
        "status": "broadcast",
        "etherscan_url": f"https://sepolia.etherscan.io/tx/{tx_hash_hex}",
    }


def reset_counter(private_key: str) -> dict:
    """Reset the counter (only owner can call this)."""
    _require_contract()
    w3 = Web3(Web3.HTTPProvider(ALCHEMY_URL))

    account = Account.from_key(private_key)
    sender = account.address

    contract = w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=COUNTER_ABI,
    )

    nonce = w3.eth.get_transaction_count(sender)
    gas_price = w3.eth.gas_price

    tx = contract.functions.reset().build_transaction({
        "from": sender,
        "nonce": nonce,
        "gas": 60_000,
        "gasPrice": gas_price,
        "chainId": SEPOLIA_CHAIN_ID,
    })

    signed = Account.sign_transaction(tx, private_key)
    tx_hash_bytes = w3.eth.send_raw_transaction(signed.raw_transaction)
    tx_hash_hex = "0x" + tx_hash_bytes.hex()

    return {
        "tx_hash": tx_hash_hex,
        "from_address": sender,
        "contract_address": CONTRACT_ADDRESS,
        "status": "broadcast",
        "etherscan_url": f"https://sepolia.etherscan.io/tx/{tx_hash_hex}",
    }
