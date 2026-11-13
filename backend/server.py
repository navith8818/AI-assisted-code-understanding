"""
FlowGen backend server.

Wraps the code-analysis engine in main.py (tree-sitter parsing, symbol
table, call graph, per-function CFGs) with a FastAPI HTTP API and integrates
with MongoDB for persisting projects, analyses, annotations, users, and chat history.

Run with:
    cd backend
    uvicorn server:app --reload --port 8000
    # Or:
    uvicorn API.server:app --reload --port 8000
"""

import os
import shutil
import subprocess
import uuid
import sys
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bson import ObjectId
from jose import jwt, JWTError

# Ensure backend root is on sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from main import (
    UPLOAD_DIR,
    extract_project,
    analyze_project,
    build_call_graph,
    build_dependency_graph,
    build_all_cfgs,
    graph_to_json,
)

from app.database import (
    client as mongo_client,
    db as mongo_db,
    ping_database,
    projects_col,
    analyses_col,
    users_col,
)
from app import auth
from app.routes import auth as auth_router_mod, projects as projects_router_mod, chat, bookings

app = FastAPI(title="FlowGen Analysis API")

# Allow the frontend (served from localhost:5173, file://, or any dev server) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all modular app routers connected to MongoDB
app.include_router(auth_router_mod.router)
app.include_router(projects_router_mod.router)
app.include_router(chat.router)
app.include_router(bookings.router)


async def get_optional_user(request: Request) -> dict | None:
    """Helper to extract the current user if an Authorization Bearer token is provided."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1].strip()
    if not token or token == "null" or token == "undefined":
        return None
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            return None
        return await users_col.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


class GitRequest(BaseModel):
    url: str


class ExplainRequest(BaseModel):
    node_id: str = ""
    snippet: str = ""
    type: str = "function"


def run_full_analysis(project_path: str) -> dict:
    """Run the whole main.py pipeline over an extracted/cloned project."""
    symbol_table = analyze_project(project_path)
    call_graph_json = graph_to_json(build_call_graph(symbol_table))
    dep_graph_json  = graph_to_json(build_dependency_graph(symbol_table, project_path))
    cfgs = build_all_cfgs(symbol_table, project_path)
    return {
        "symbol_table": symbol_table,
        "call_graph":   call_graph_json,
        "dep_graph":    dep_graph_json,
        "cfgs":         cfgs,
        "project_path": project_path,   # used by /api/file-content
    }


@app.get("/api/health")
async def health():
    """Health check endpoint that also verifies MongoDB connectivity."""
    db_connected = await ping_database()
    return {
        "status": "ok",
        "mongodb": {
            "connected": db_connected,
            "database": mongo_db.name if db_connected else None
        }
    }


@app.get("/api/projects")
async def list_recent_projects(request: Request, search: str = None):
    """
    Retrieve project history stored in MongoDB.
    Filters by logged-in user if authenticated, and filters by search term if provided.
    """
    user = await get_optional_user(request)
    query = {}
    if user:
        # If user is authenticated, query for their projects or legacy unowned projects
        user_id_str = str(user["_id"])
        query["$or"] = [
            {"user_id": user_id_str},
            {"user_id": None},
            {"user_id": {"$exists": False}}
        ]
    
    if search:
        search_filter = {"name": {"$regex": search.strip(), "$options": "i"}}
        if "$or" in query:
            query = {"$and": [query, search_filter]}
        else:
            query["name"] = search_filter["name"]

    try:
        cursor = projects_col.find(query).sort("created_at", -1).limit(50)
        items = []
        async for doc in cursor:
            # Check if this project has analysis
            analysis = await analyses_col.find_one({"project_id": str(doc["_id"])})
            symbol_count = len(analysis.get("symbol_table", {})) if analysis else 0
            call_nodes = len(analysis.get("call_graph", {}).get("nodes", [])) if analysis else 0

            items.append({
                "id": str(doc["_id"]),
                "name": doc.get("name", "Unnamed"),
                "source": doc.get("source", "zip"),
                "user_id": doc.get("user_id"),
                "username": doc.get("username"),
                "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None,
                "stats": {
                    "symbols": symbol_count,
                    "call_nodes": call_nodes,
                }
            })
        return {"projects": items}
    except Exception as e:
        return {"projects": [], "error": str(e)}


@app.get("/api/projects/{project_id}/analysis")
async def get_project_analysis(project_id: str):
    """Retrieve full analysis results for a project to view it without re-analyzing."""
    try:
        project = await projects_col.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        analysis = await analyses_col.find_one({"project_id": project_id})
        if not analysis:
            try:
                analysis = await analyses_col.find_one({"project_id": ObjectId(project_id)})
            except Exception:
                pass

        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found for this project")

        return {
            "project_name": project.get("name", "Project"),
            "project_id": str(project["_id"]),
            "analysis_id": str(analysis["_id"]),
            "symbol_table": analysis.get("symbol_table", {}),
            "call_graph": analysis.get("call_graph", {}),
            "dep_graph": analysis.get("dep_graph", {}),
            "cfgs": analysis.get("cfgs", {}),
            "project_path": project.get("zip_path", ""),
            "created_at": project.get("created_at").isoformat() if project.get("created_at") else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/projects/{project_id}")
async def delete_project_endpoint(project_id: str, request: Request):
    """Delete a project and its associated analyses."""
    user = await get_optional_user(request)
    try:
        project = await projects_col.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        if project.get("user_id") and user and project.get("user_id") != str(user["_id"]):
            raise HTTPException(status_code=403, detail="Not authorized to delete this project")

        await projects_col.delete_one({"_id": ObjectId(project_id)})
        await analyses_col.delete_many({"project_id": project_id})
        return {"deleted": project_id, "success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload-zip")
async def upload_zip(request: Request, file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Please upload a .zip file")

    user = await get_optional_user(request)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filepath = os.path.join(UPLOAD_DIR, file.filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        project_path = extract_project(filepath)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not extract zip: {e}")

    try:
        result = run_full_analysis(project_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    pname = os.path.basename(project_path)
    result["project_name"] = pname

    # Persist project and analysis to MongoDB
    try:
        project_doc = {
            "name": pname,
            "user_id": str(user["_id"]) if user else None,
            "username": user["username"] if user else None,
            "zip_path": filepath,
            "source": "zip",
            "created_at": datetime.utcnow(),
        }
        p_res = await projects_col.insert_one(project_doc)
        analysis_doc = {
            "project_id": str(p_res.inserted_id),
            "symbol_table": result.get("symbol_table", {}),
            "call_graph": result.get("call_graph", {}),
            "dep_graph": result.get("dep_graph", {}),
            "cfgs": result.get("cfgs", {}),
            "created_at": datetime.utcnow(),
        }
        a_res = await analyses_col.insert_one(analysis_doc)
        result["project_id"] = str(p_res.inserted_id)
        result["analysis_id"] = str(a_res.inserted_id)
    except Exception as e:
        print(f"MongoDB persistence warning: {e}")

    return result


@app.post("/api/analyze-git")
async def analyze_git(request: Request, req: GitRequest):
    user = await get_optional_user(request)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    repo_name = req.url.rstrip("/").split("/")[-1].replace(".git", "") or "repo"
    dest = os.path.join(UPLOAD_DIR, f"{repo_name}-{uuid.uuid4().hex[:8]}")

    try:
        subprocess.run(
            ["git", "clone", "--depth", "1", req.url, dest],
            check=True,
            capture_output=True,
            timeout=120,
        )
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="git is not installed on the server")
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=f"git clone failed: {e.stderr.decode(errors='ignore')}")
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="git clone timed out")

    try:
        result = run_full_analysis(dest)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    result["project_name"] = repo_name

    # Persist project and analysis to MongoDB
    try:
        project_doc = {
            "name": repo_name,
            "git_url": req.url,
            "user_id": str(user["_id"]) if user else None,
            "username": user["username"] if user else None,
            "source": "git",
            "created_at": datetime.utcnow(),
        }
        p_res = await projects_col.insert_one(project_doc)
        analysis_doc = {
            "project_id": str(p_res.inserted_id),
            "symbol_table": result.get("symbol_table", {}),
            "call_graph": result.get("call_graph", {}),
            "dep_graph": result.get("dep_graph", {}),
            "cfgs": result.get("cfgs", {}),
            "created_at": datetime.utcnow(),
        }
        a_res = await analyses_col.insert_one(analysis_doc)
        result["project_id"] = str(p_res.inserted_id)
        result["analysis_id"] = str(a_res.inserted_id)
    except Exception as e:
        print(f"MongoDB persistence warning: {e}")

    return result


class FileContentRequest(BaseModel):
    project_name: str
    file_path: str


@app.post("/api/file-content")
def get_file_content(req: FileContentRequest):
    """
    Return the raw source of a single file inside an uploaded project.
    project_name  — the folder name under uploads/  (e.g. "my_project")
    file_path     — relative path inside that folder (e.g. "src/main.py")
    """
    safe_rel = os.path.normpath(req.file_path).lstrip("/\\").lstrip(".").lstrip("/\\")
    project_dir = os.path.join(UPLOAD_DIR, req.project_name)
    full_path   = os.path.join(project_dir, safe_rel)
    full_path   = os.path.abspath(full_path)
    project_dir = os.path.abspath(project_dir)

    if not full_path.startswith(project_dir):
        raise HTTPException(status_code=403, detail="Path traversal not allowed")
    if not os.path.isfile(full_path):
        for root, _, files in os.walk(project_dir):
            for f in files:
                if os.path.join(root, f).replace("\\", "/").endswith(req.file_path.replace("\\", "/")):
                    full_path = os.path.join(root, f)
                    break
            else:
                continue
            break
        else:
            raise HTTPException(status_code=404, detail=f"File not found: {req.file_path}")

    try:
        with open(full_path, "r", encoding="utf-8", errors="replace") as fh:
            content = fh.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"content": content, "path": req.file_path}


@app.post("/api/explain")
async def api_explain(req: ExplainRequest):
    """Explain a code node using Gemini AI."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "summary": "Gemini API key is not configured. Add GEMINI_API_KEY in backend/.env to enable AI explanations.",
            "node_id": req.node_id
        }

    try:
        import google.genai as genai
        client = genai.Client(api_key=api_key)
        prompt = f"""You are a code analysis assistant. Analyze this {req.type} and explain it clearly.

Function/Method name: {req.node_id}

Source code:
{req.snippet}

Provide a concise summary:
1. **What it does** — one sentence overview
2. **Inputs** — parameters and types
3. **Process** — core logic steps
4. **Output/Effect** — return values or mutations
5. **Calls** — other functions called
Keep it short and clear."""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        summary = response.text if hasattr(response, "text") else str(response)
        return {"summary": summary, "node_id": req.node_id}
    except Exception as e:
        return {"summary": f"Could not generate AI explanation: {e}", "node_id": req.node_id}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
