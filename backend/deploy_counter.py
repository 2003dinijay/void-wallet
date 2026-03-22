"""
Deploy the Counter contract to Ethereum Sepolia testnet.

Prerequisites:
  pip install py-solc-x

Usage:
  python deploy_counter.py

The script will:
1. Compile Counter.sol using Solidity 0.8.20
2. Ask for your deployer private key
3. Deploy the contract to Sepolia via Alchemy
4. Print the deployed contract address
5. Tell you to add it to your .env file
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

ALCHEMY_URL = os.getenv("ALCHEMY_URL", "")
if not ALCHEMY_URL:
    print("ERROR: ALCHEMY_URL is not set in .env")
    sys.exit(1)

try:
    from solcx import compile_source, install_solc
except ImportError:
    print("ERROR: py-solc-x is not installed.")
    print("Run:  pip install py-solc-x")
    sys.exit(1)

from web3 import Web3
from eth_account import Account

# Read the Solidity source
sol_path = os.path.join(os.path.dirname(__file__), "Counter.sol")
with open(sol_path) as f:
    source = f.read()

print("Installing Solidity 0.8.20 compiler (downloads once, ~30 MB)...")
install_solc("0.8.20")

print("Compiling Counter.sol...")
compiled = compile_source(
    source,
    output_values=["abi", "bin"],
    solc_version="0.8.20",
)
contract_id = "<stdin>:Counter"
abi = compiled[contract_id]["abi"]
bytecode = compiled[contract_id]["bin"]
print(f"  ABI functions: {[x['name'] for x in abi if x['type'] == 'function']}")
print(f"  Bytecode size: {len(bytecode) // 2} bytes")

# Connect to Sepolia
w3 = Web3(Web3.HTTPProvider(ALCHEMY_URL))
if not w3.is_connected():
    print("ERROR: Cannot connect to Alchemy. Check your ALCHEMY_URL.")
    sys.exit(1)
print(f"\nConnected to Sepolia (chain ID: {w3.eth.chain_id})")

# Ask for deployer key
private_key = input("\nEnter deployer private key (0x...): ").strip()
if not private_key.startswith("0x"):
    private_key = "0x" + private_key

account = Account.from_key(private_key)
print(f"Deployer address: {account.address}")

balance_eth = w3.eth.get_balance(account.address) / 1e18
print(f"Balance: {balance_eth:.6f} Sepolia ETH")
if balance_eth < 0.001:
    print("WARNING: Low balance. Get Sepolia ETH from https://sepoliafaucet.com")

# Build and send deployment tx
Counter = w3.eth.contract(abi=abi, bytecode=bytecode)
nonce = w3.eth.get_transaction_count(account.address)
gas_price = w3.eth.gas_price

deploy_tx = Counter.constructor().build_transaction({
    "from": account.address,
    "nonce": nonce,
    "gas": 500_000,
    "gasPrice": gas_price,
    "chainId": 11155111,
})

signed = account.sign_transaction(deploy_tx)
print("\nSending deployment transaction...")
tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
tx_hash_hex = "0x" + tx_hash.hex()
print(f"Tx hash: {tx_hash_hex}")
print(f"Track:   https://sepolia.etherscan.io/tx/{tx_hash_hex}")
print("\nWaiting for confirmation (up to 2 minutes)...")

receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

if receipt["status"] == 1:
    contract_address = receipt["contractAddress"]
    print(f"\n✓ Counter deployed successfully!")
    print(f"  Contract address: {contract_address}")
    print(f"  Etherscan:        https://sepolia.etherscan.io/address/{contract_address}")
    print(f"\nAdd this to your backend/.env file:")
    print(f"  COUNTER_CONTRACT_ADDRESS={contract_address}")
else:
    print("\n✗ Deployment failed. Check Etherscan for details.")
    sys.exit(1)
