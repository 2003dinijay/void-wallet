from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_db, close_db
from routers import ethereum, solana, crypto_info
from routers import auth, user_wallets
from routers import blockchain, counter


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="VoidWallet API",
    version="2.0.0",
    description="Blockchain cryptography educational demo — with user accounts and wallet management",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(ethereum.router,     prefix="/api/ethereum",      tags=["Ethereum"])
app.include_router(solana.router,       prefix="/api/solana",        tags=["Solana"])
app.include_router(crypto_info.router,  prefix="/api/crypto",        tags=["Crypto Info"])
app.include_router(auth.router,         prefix="/api/auth",          tags=["Auth"])
app.include_router(user_wallets.router, prefix="/api/wallets",       tags=["Wallets"])
app.include_router(blockchain.router,   prefix="/api/chain",         tags=["Sepolia Chain"])
app.include_router(counter.router,      prefix="/api/counter",       tags=["Counter Contract"])


@app.get("/")
def root():
    return {"message": "VoidWallet API v2 is running", "docs": "/docs"}
