import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Explicitly point to the .env file location
# This works no matter where you run uvicorn from
BASE_DIR = Path(__file__).resolve().parent.parent  # goes up to backend/
load_dotenv(BASE_DIR / ".env")

MONGODB_URL = os.getenv("MONGODB_URL")
DB_NAME     = os.getenv("DB_NAME")


client = AsyncIOMotorClient(MONGODB_URL)
db     = client[DB_NAME]

users_col       = db["users"]
projects_col    = db["projects"]
analyses_col    = db["analyses"]
annotations_col = db["annotations"]
bookings_col    = db["bookings"]
