import os
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

ALCHEMY_URL = os.getenv("ALCHEMY_URL", "")
SEPOLIA_CHAIN_ID = 11155111


def _w3() -> Web3:
    return Web3(Web3.HTTPProvider(ALCHEMY_URL))


def get_balance(address: str) -> dict:
    w3 = _w3()
    addr = Web3.to_checksum_address(address)
    balance_wei = w3.eth.get_balance(addr)
    balance_eth = balance_wei / 1e18
    return {
        "address": addr,
        "balance_wei": balance_wei,
        "balance_eth": round(balance_eth, 8),
        "network": "Sepolia Testnet",
        "chain_id": SEPOLIA_CHAIN_ID,
        "etherscan_url": f"https://sepolia.etherscan.io/address/{addr}",
    }


def get_nonce(address: str) -> dict:
    w3 = _w3()
    addr = Web3.to_checksum_address(address)
    nonce = w3.eth.get_transaction_count(addr)
    return {"address": addr, "nonce": nonce}


def get_gas_price() -> dict:
    w3 = _w3()
    gas_price_wei = w3.eth.gas_price
    gas_price_gwei = gas_price_wei / 1e9
    return {
        "gas_price_wei": gas_price_wei,
        "gas_price_gwei": round(gas_price_gwei, 4),
        "network": "Sepolia Testnet",
    }


def broadcast_transaction(raw_tx_hex: str) -> dict:
    w3 = _w3()
    raw_hex = raw_tx_hex[2:] if raw_tx_hex.startswith("0x") else raw_tx_hex
    raw_bytes = bytes.fromhex(raw_hex)
    tx_hash_bytes = w3.eth.send_raw_transaction(raw_bytes)
    tx_hash_hex = "0x" + tx_hash_bytes.hex()
    return {
        "tx_hash": tx_hash_hex,
        "status": "broadcast",
        "etherscan_url": f"https://sepolia.etherscan.io/tx/{tx_hash_hex}",
    }


def get_tx_status(tx_hash: str) -> dict:
    w3 = _w3()
    try:
        receipt = w3.eth.get_transaction_receipt(tx_hash)
        if receipt is None:
            return {"tx_hash": tx_hash, "status": "pending", "block_number": None, "gas_used": None}
        return {
            "tx_hash": tx_hash,
            "status": "success" if receipt["status"] == 1 else "failed",
            "block_number": receipt["blockNumber"],
            "gas_used": receipt["gasUsed"],
            "etherscan_url": f"https://sepolia.etherscan.io/tx/{tx_hash}",
        }
    except Exception:
        return {"tx_hash": tx_hash, "status": "pending", "block_number": None, "gas_used": None}
