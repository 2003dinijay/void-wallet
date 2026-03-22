from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DB_NAME = os.getenv("DB_NAME", "voidwallet")

client: AsyncIOMotorClient = None


async def connect_db():
    global client
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.wallets.create_index("address")
    await db.wallets.create_index("user_id")
    print(f"Connected to MongoDB: {DB_NAME}")


async def close_db():
    global client
    if client:
        client.close()


def get_db():
    return client[DB_NAME]
