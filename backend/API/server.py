import sys, os

# Tell Python where to find the app/ folder
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, projects

app = FastAPI(title="Code Analyzer API")

# Allow React (localhost:5173) to talk to FastAPI (localhost:8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)