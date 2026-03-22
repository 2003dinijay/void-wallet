from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId
from database import get_db
from auth import get_current_user, get_current_user_optional
import re
import base58 as base58lib
from eth_utils import to_checksum_address

router = APIRouter()


def wallet_out(w: dict) -> dict:
    return {
        "id": str(w["_id"]),
        "user_id": str(w["user_id"]),
        "username": w.get("username", ""),
        "name": w.get("name", ""),
        "chain": w["chain"],
        "address": w["address"],
        "public_key": w["public_key"],
        "derivation_path": w.get("derivation_path", ""),
        "is_public": w.get("is_public", True),
        "created_at": w["created_at"].isoformat(),
    }


# ── Validation helpers ────────────────────────────────────────────────────────

def validate_eth_address(address: str) -> dict:
    """Returns {valid, checksummed, error}"""
    if not re.match(r"^0x[0-9a-fA-F]{40}$", address):
        return {"valid": False, "checksummed": None, "error": "Not a valid Ethereum address format (must be 0x + 40 hex chars)"}
    try:
        checksummed = to_checksum_address(address.lower())
        checksum_ok = checksummed == address
        return {
            "valid": True,
            "checksummed": checksummed,
            "checksum_ok": checksum_ok,
            "error": None if checksum_ok else "Address is valid but EIP-55 checksum is wrong — use the corrected version",
        }
    except Exception as e:
        return {"valid": False, "checksummed": None, "error": str(e)}


def validate_sol_address(address: str) -> dict:
    """Returns {valid, error}"""
    try:
        decoded = base58lib.b58decode(address)
        if len(decoded) != 32:
            return {"valid": False, "error": f"Solana address must decode to 32 bytes, got {len(decoded)}"}
        return {"valid": True, "error": None}
    except Exception:
        return {"valid": False, "error": "Not valid Base58 encoding"}


# ── Save wallet ───────────────────────────────────────────────────────────────

class SaveWalletRequest(BaseModel):
    chain: str               # "eth" or "sol"
    address: str
    public_key: str
    derivation_path: str
    name: Optional[str] = ""
    is_public: Optional[bool] = True


@router.post("/save")
async def save_wallet(req: SaveWalletRequest, current_user=Depends(get_current_user)):
    if req.chain not in ("eth", "sol"):
        raise HTTPException(status_code=400, detail="chain must be 'eth' or 'sol'")

    db = get_db()

    # Check duplicate
    existing = await db.wallets.find_one({"address": req.address, "user_id": current_user["_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="You already saved this wallet")

    doc = {
        "user_id": current_user["_id"],
        "username": current_user["username"],
        "name": req.name or f"My {req.chain.upper()} Wallet",
        "chain": req.chain,
        "address": req.address,
        "public_key": req.public_key,
        "derivation_path": req.derivation_path,
        "is_public": req.is_public,
        "created_at": datetime.utcnow(),
    }
    result = await db.wallets.insert_one(doc)
    doc["_id"] = result.inserted_id
    return wallet_out(doc)


# ── Get my wallets ────────────────────────────────────────────────────────────

@router.get("/mine")
async def my_wallets(current_user=Depends(get_current_user)):
    db = get_db()
    cursor = db.wallets.find({"user_id": current_user["_id"]}).sort("created_at", -1)
    wallets = []
    async for w in cursor:
        wallets.append(wallet_out(w))
    return wallets


# ── Delete a wallet ───────────────────────────────────────────────────────────

@router.delete("/{wallet_id}")
async def delete_wallet(wallet_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    result = await db.wallets.delete_one({"_id": ObjectId(wallet_id), "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Wallet not found or not yours")
    return {"deleted": True}


# ── Get wallet by address (public share page) ─────────────────────────────────

@router.get("/address/{address}")
async def get_wallet_by_address(address: str, current_user=Depends(get_current_user_optional)):
    db = get_db()
    wallet = await db.wallets.find_one({"address": address})
    if not wallet:
        raise HTTPException(status_code=404, detail="No saved wallet found with this address")
    if not wallet.get("is_public"):
        # Only the owner can see private wallets
        if not current_user or current_user["_id"] != wallet["user_id"]:
            raise HTTPException(status_code=403, detail="This wallet is private")
    return wallet_out(wallet)


# ── Validate address ──────────────────────────────────────────────────────────

@router.get("/validate/{chain}/{address}")
async def validate_address(chain: str, address: str):
    if chain == "eth":
        result = validate_eth_address(address)
        return {"chain": "eth", **result}
    elif chain == "sol":
        result = validate_sol_address(address)
        return {"chain": "sol", **result}
    else:
        raise HTTPException(status_code=400, detail="chain must be 'eth' or 'sol'")


# ── Search public wallets ─────────────────────────────────────────────────────

@router.get("/search")
async def search_wallets(username: Optional[str] = None, chain: Optional[str] = None):
    db = get_db()
    query: dict = {"is_public": True}
    if username:
        query["username"] = {"$regex": username, "$options": "i"}
    if chain:
        query["chain"] = chain
    cursor = db.wallets.find(query).sort("created_at", -1).limit(50)
    wallets = []
    async for w in cursor:
        wallets.append(wallet_out(w))
    return wallets
