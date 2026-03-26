from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import ssl
import certifi

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DB_NAME = os.getenv("DB_NAME", "voidwallet")

client: AsyncIOMotorClient = None


async def connect_db():
    global client
    
    # Check if we are connecting to a local or remote MongoDB
    is_local = "mongodb://" in MONGODB_URL and not "mongodb+srv://" in MONGODB_URL
    
    if is_local:
        client = AsyncIOMotorClient(MONGODB_URL)
    else:
        # Create SSL context using certifi certificates
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        client = AsyncIOMotorClient(
            MONGODB_URL,
            tlsCAFile=certifi.where(),
            tlsAllowInvalidCertificates=True
        )
        
    db = client[DB_NAME]
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