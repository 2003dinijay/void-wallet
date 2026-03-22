from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.blockchain import (
    get_balance,
    get_nonce,
    get_gas_price,
    broadcast_transaction,
    get_tx_status,
)

router = APIRouter()


@router.get("/balance/{address}")
async def chain_balance(address: str):
    try:
        return get_balance(address)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/nonce/{address}")
async def chain_nonce(address: str):
    try:
        return get_nonce(address)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/gas-price")
async def chain_gas_price():
    try:
        return get_gas_price()
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


class BroadcastBody(BaseModel):
    raw_tx: str  # hex string with or without 0x prefix


@router.post("/broadcast")
async def chain_broadcast(body: BroadcastBody):
    try:
        return broadcast_transaction(body.raw_tx)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/tx/{tx_hash}")
async def chain_tx_status(tx_hash: str):
    try:
        return get_tx_status(tx_hash)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
