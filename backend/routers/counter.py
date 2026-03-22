from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.counter_contract import get_count, increment_counter, reset_counter

router = APIRouter()


@router.get("/value")
async def counter_value():
    try:
        return get_count()
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class IncrementBody(BaseModel):
    private_key: str  # hex private key with 0x prefix


@router.post("/increment")
async def counter_increment(body: IncrementBody):
    try:
        return increment_counter(body.private_key)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reset")
async def counter_reset(body: IncrementBody):
    """Reset the counter — only the contract owner can call this."""
    try:
        return reset_counter(body.private_key)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
