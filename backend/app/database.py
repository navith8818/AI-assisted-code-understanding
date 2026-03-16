import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()  # reads your .env file

# Connect to MongoDB running on your machine
client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
db = client[os.getenv("DB_NAME")]  # selects the "codeanalyzer" database

# These are like tables in SQL — MongoDB calls them collections
users_col       = db["users"]
projects_col    = db["projects"]
analyses_col    = db["analyses"]
annotations_col = db["annotations"]