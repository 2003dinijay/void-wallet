from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId
from database import get_db
from auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter()


def user_out(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "username": user["username"],
        "created_at": user["created_at"].isoformat(),
    }


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register", status_code=201)
async def register(req: RegisterRequest):
    db = get_db()

    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    existing = await db.users.find_one({"$or": [{"email": req.email}, {"username": req.username}]})
    if existing:
        if existing.get("email") == req.email:
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=400, detail="Username already taken")

    user = {
        "email": req.email,
        "username": req.username,
        "password_hash": await run_in_threadpool(hash_password, req.password),
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user)
    user["_id"] = result.inserted_id

    token = create_token(str(result.inserted_id))
    return {"token": token, "user": user_out(user)}


@router.post("/login")
async def login(req: LoginRequest):
    db = get_db()

    user = await db.users.find_one({"email": req.email})
    if not user or not await run_in_threadpool(verify_password, req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(str(user["_id"]))
    return {"token": token, "user": user_out(user)}


@router.get("/me")
async def me(current_user=Depends(get_current_user)):
    return user_out(current_user)
