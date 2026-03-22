from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.sol_wallet import generate_solana_wallet, sign_solana_transaction

router = APIRouter()


class SolSignRequest(BaseModel):
    private_key_hex: str
    recipient: str
    lamports: int = 1000000


@router.post("/generate")
def sol_generate():
    try:
        return generate_solana_wallet()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sign")
def sol_sign(req: SolSignRequest):
    try:
        return sign_solana_transaction(
            private_key_hex=req.private_key_hex,
            recipient=req.recipient,
            lamports=req.lamports,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
