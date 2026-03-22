# Running the Project

Complete guide to getting everything running locally from scratch.

---

## Prerequisites

- Python 3.11 or 3.12 (NOT 3.14 — many crypto packages don't have wheels for it yet)
- Node.js 18+
- Two terminal windows
- A MongoDB Atlas account (or use the existing connection string in `.env`)
- The Alchemy Sepolia RPC URL is already in `.env`

---

## Step 1 — Backend Setup (first time only)

```bash
cd D:/Projects/Blockchain/dini-blockchain/VoidWallet/backend

# Create the virtual environment (use Python 3.11 or 3.12)
py -3.12 -m venv venv          # Windows, if py launcher is installed
python3.12 -m venv venv        # or this

# Activate it
venv\Scripts\activate           # Windows CMD or PowerShell
source venv/Scripts/activate    # Git Bash / MINGW

# Install all dependencies
pip install -r requirements.txt
```

### Set up the .env file
Copy the example and fill in your values:
```bash
cp .env.example .env
```

The `.env` file needs these values:
```
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/?appName=yourapp
DB_NAME=voidwallet
JWT_SECRET=pick-any-long-random-string-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# Sepolia testnet (already filled in)
ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/zaIrqdCcVZqqVqF4-l_7t

# Set this after deploying the Counter contract (see Step 4)
COUNTER_CONTRACT_ADDRESS=
```

---

## Step 2 — Start the Backend (Terminal 1)

```bash
cd backend

# Activate the venv (every time you open a new terminal)
venv\Scripts\activate           # Windows CMD / PowerShell
source venv/Scripts/activate    # Git Bash

# Start the server
uvicorn main:app --reload --port 8000
```

You should see:
```
Connected to MongoDB: voidwallet
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

The `--reload` flag auto-restarts the server when you edit Python files.

---

## Step 3 — Start the Frontend (Terminal 2)

```bash
cd frontend

# Install packages (first time only)
npm install

# Start the dev server
npm run dev
```

You should see:
```
▲ Next.js 14.2.5
- Local: http://localhost:3000
```

---

## Step 4 — Deploy the Counter Contract (optional, one-time)

This deploys the `Counter.sol` smart contract to Ethereum Sepolia testnet. You need a small amount of Sepolia ETH to pay gas.

**Get free Sepolia ETH first:**
- https://sepoliafaucet.com
- https://faucet.quicknode.com/ethereum/sepolia

**Then deploy:**
```bash
cd backend
source venv/Scripts/activate

# Install the Solidity compiler downloader (one-time)
pip install py-solc-x

# Run the deploy script
python deploy_counter.py
```

The script will:
1. Download Solidity 0.8.20 compiler (~30 MB, one-time)
2. Ask for your deployer private key
3. Deploy the contract to Sepolia
4. Print the contract address

Copy the address into your `.env`:
```
COUNTER_CONTRACT_ADDRESS=0xYourDeployedAddress
```

Then restart the backend. The Testnet page will now show the live counter.

---

## What you should see

| URL | What it is |
|---|---|
| http://localhost:3000 | Home page |
| http://localhost:3000/register | Create an account |
| http://localhost:3000/login | Sign in |
| http://localhost:3000/dashboard | Your wallets + address validator |
| http://localhost:3000/wallet | Generate a wallet |
| http://localhost:3000/sign | Sign a transaction |
| http://localhost:3000/testnet | **Live Sepolia testnet panel** |
| http://localhost:3000/visualize | Crypto comparison |
| http://localhost:8000/docs | Python API docs (Swagger UI) |

---

## Typical first-use flow

### Without the testnet (wallet generation + signing demo):
1. Go to http://localhost:3000/register → create an account
2. You're auto-redirected to the dashboard
3. Click **"+ New Wallet"** → go to the wallet generator
4. Pick ETH or SOL → click **Generate**
5. Reveal and copy your private key (you'll need it for signing)
6. Click **"Save to Account"** → wallet saved to MongoDB
7. Click **"View share page"** → get a public URL to share
8. Go to http://localhost:3000/sign → paste your private key → sign a transaction
9. Go to **Dashboard** → validate any address

### With the testnet (real blockchain):
1. Generate an ETH wallet (steps above)
2. Copy the wallet address
3. Go to https://sepoliafaucet.com → paste address → get free Sepolia ETH
4. Go to http://localhost:3000/testnet → paste address → see live balance
5. On the Sign page, set **chain_id to 11155111** (Sepolia) and **nonce to 0** → sign
6. Copy the `raw_transaction` hex from the Sign page result
7. Go to the Testnet page → Broadcast section → paste the hex → broadcast
8. Click the Etherscan link to watch it confirm on-chain

### Using the Counter contract:
1. Deploy the contract (Step 4 above)
2. Go to http://localhost:3000/testnet → the Counter shows the current count
3. Paste your ETH private key in the input field
4. Click **Increment Counter** → transaction is signed and sent
5. Count updates automatically after ~4 seconds (one block)
6. Click the Etherscan link to see your transaction on-chain

---

## Common Problems

### "Cannot connect to backend" error on the website
- Make sure the Python backend is running in Terminal 1
- Check Terminal 1 shows "Application startup complete"
- Try opening http://localhost:8000 directly — if it loads, backend is fine

### MongoDB connection fails on startup
- Check your `.env` file exists in the `backend/` folder
- Make sure `MONGODB_URL` is correct and your Atlas cluster is accessible
- Check your Atlas network access allows connections from your IP (or 0.0.0.0/0 for dev)

### Testnet page shows "Cannot connect" or no balance
- The Alchemy URL is already set in `.env` — this should work out of the box
- If you replaced the Alchemy URL, make sure it is a valid Sepolia endpoint
- Check http://localhost:8000/api/chain/gas-price in your browser — if it returns data, the connection is fine

### Counter shows "Contract not yet deployed"
- Run `python deploy_counter.py` from the backend folder
- Add the printed address to `.env` as `COUNTER_CONTRACT_ADDRESS=0x...`
- Restart the backend server

### "Only owner can reset" error
- You are calling reset with a private key that doesn't belong to the deployer address
- Only the wallet that originally deployed the contract can reset it

### `venv\Scripts\activate` not found
```bash
py -3.12 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Python packages fail to install (coincurve error)
You are running Python 3.14 — use Python 3.12 instead:
```bash
py --list          # check available versions
py -3.12 -m venv venv
```

### Port already in use
```bash
# Find and kill what's on port 8000
netstat -ano | findstr :8000
taskkill /PID <pid_number> /F
```

### `npm: command not found`
Download Node.js LTS from nodejs.org.

---

## Stopping the servers

Press `Ctrl + C` in each terminal.

---

## GitHub setup

```bash
cd D:/Projects/Blockchain/dini-blockchain/VoidWallet
git init
git add .
git commit -m "Initial commit"
gh repo create VoidWallet --public --source=. --push
```

The `.gitignore` files ensure secrets (`.env`) and build artifacts (`venv/`, `node_modules/`, `.next/`) are never committed.
