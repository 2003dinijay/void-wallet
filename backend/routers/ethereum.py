from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.eth_wallet import generate_ethereum_wallet, sign_ethereum_transaction

router = APIRouter()


class EthSignRequest(BaseModel):
    private_key: str
    to: str
    value_eth: float = 0.01
    gas_limit: int = 21000
    gas_price_gwei: float = 20.0
    nonce: int = 0
    chain_id: int = 1


@router.post("/generate")
def eth_generate():
    try:
        return generate_ethereum_wallet()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sign")
def eth_sign(req: EthSignRequest):
    try:
        return sign_ethereum_transaction(
            private_key=req.private_key,
            to=req.to,
            value_eth=req.value_eth,
            gas_limit=req.gas_limit,
            gas_price_gwei=req.gas_price_gwei,
            nonce=req.nonce,
            chain_id=req.chain_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
