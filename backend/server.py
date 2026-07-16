"""
FlowGen backend server.

Wraps the code-analysis engine in main.py (tree-sitter parsing, symbol
table, call graph, per-function CFGs) with a FastAPI HTTP API so the
FlowGen frontend can upload a .zip or a git URL and get back structured
results.

Run with:
    pip install fastapi uvicorn python-multipart networkx tree-sitter \
                tree-sitter-python tree-sitter-c tree-sitter-cpp tree-sitter-javascript
    uvicorn server:app --reload --port 8000

Requires the `git` CLI to be installed for the /api/analyze-git endpoint.
"""

import os
import shutil
import subprocess
import uuid

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from main import (
    UPLOAD_DIR,
    extract_project,
    analyze_project,
    build_call_graph,
    build_dependency_graph,
    build_all_cfgs,
    graph_to_json,
)

app = FastAPI(title="FlowGen Analysis API")

# Allow the static frontend (served from file:// or any dev server) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GitRequest(BaseModel):
    url: str


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
def health():
    return {"status": "ok"}


@app.post("/api/upload-zip")
async def upload_zip(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Please upload a .zip file")

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

    result["project_name"] = os.path.basename(project_path)
    return result


@app.post("/api/analyze-git")
def analyze_git(req: GitRequest):
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
    # Sanitise: never allow path traversal
    safe_rel = os.path.normpath(req.file_path).lstrip("/\\").lstrip(".").lstrip("/\\")
    project_dir = os.path.join(UPLOAD_DIR, req.project_name)
    full_path   = os.path.join(project_dir, safe_rel)
    full_path   = os.path.abspath(full_path)
    project_dir = os.path.abspath(project_dir)

    if not full_path.startswith(project_dir):
        raise HTTPException(status_code=403, detail="Path traversal not allowed")
    if not os.path.isfile(full_path):
        # Try searching recursively (node data often contains relative paths from the project root)
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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
