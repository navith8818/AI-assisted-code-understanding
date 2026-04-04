from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from app.auth import get_current_user
from app.models import AnalysisOut, ProjectOut, AnnotationCreate, AnnotationOut
import google.genai as genai
from app import crud
import sys, os

import sys, os
# Build absolute path to the analyzer folder — works on all platforms
ANALYZER_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "analyzer")
)
sys.path.insert(0, ANALYZER_DIR)

from main import (
    save_file, extract_project, analyze_project,
    build_call_graph, build_dependency_graph, graph_to_json,
)

router = APIRouter(tags=["Projects"])


@router.post("/analyze", response_model=AnalysisOut)
async def analyze(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    user_id  = str(current_user["_id"])
    zip_path = save_file(file)
    project  = await crud.create_project(user_id, file.filename, zip_path)

    extract_path = extract_project(zip_path)
    symbol_table = analyze_project(extract_path)

    call_graph = graph_to_json(build_call_graph(symbol_table))
    dep_graph  = graph_to_json(build_dependency_graph(symbol_table, extract_path))

    return await crud.create_analysis(
        project["id"], symbol_table, call_graph, dep_graph
    )


@router.get("/projects", response_model=list[ProjectOut])
async def list_projects(current_user: dict = Depends(get_current_user)):
    return await crud.get_user_projects(str(current_user["_id"]))


@router.get("/projects/{project_id}/analyses", response_model=list[AnalysisOut])
async def list_analyses(project_id: str,
                         current_user: dict = Depends(get_current_user)):
    return await crud.get_analyses_for_project(project_id)


@router.get("/analyses/{analysis_id}", response_model=AnalysisOut)
async def get_analysis(analysis_id: str,
                        current_user: dict = Depends(get_current_user)):
    analysis = await crud.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


@router.post("/analyses/{analysis_id}/annotations", response_model=AnnotationOut)
async def add_annotation(analysis_id: str, body: AnnotationCreate,
                          current_user: dict = Depends(get_current_user)):
    return await crud.create_annotation(
        analysis_id, body.node_id, body.note, body.color
    )


@router.get("/analyses/{analysis_id}/annotations", response_model=list[AnnotationOut])
async def get_annotations(analysis_id: str,
                           current_user: dict = Depends(get_current_user)):
    return await crud.get_annotations(analysis_id)


@router.delete("/annotations/{annotation_id}")
async def delete_annotation(annotation_id: str,
                              current_user: dict = Depends(get_current_user)):
    ann = await crud.delete_annotation(annotation_id)
    if not ann:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": annotation_id}


# ── NEW: Serve source file contents ──────────────────────────────────────────
@router.get("/analyses/{analysis_id}/file", response_class=PlainTextResponse)
async def get_file_content(
    analysis_id: str,
    filepath: str,                              # e.g. ?filepath=src/main.py
    current_user: dict = Depends(get_current_user),
):
    """
    Returns raw source code of a file inside the analyzed project.
    filepath is relative to the extracted project root.
    """
    analysis = await crud.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Get the project to find where the zip was extracted
    from app.database import projects_col
    from bson import ObjectId
    project = await projects_col.find_one(
        {"_id": ObjectId(analysis["project_id"])}
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Build the full path to the file
    zip_path     = project["zip_path"]                        # uploads/foo.zip
    project_name = os.path.basename(zip_path).replace(".zip", "")
    extract_root = os.path.join("uploads", project_name)     # uploads/foo/
    full_path    = os.path.join(extract_root, filepath)

    # Security check — make sure path doesn't escape the project folder
    full_path    = os.path.normpath(full_path)
    extract_root = os.path.normpath(extract_root)
    if not full_path.startswith(extract_root):
        raise HTTPException(status_code=403, detail="Access denied")

    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail=f"File not found: {filepath}")

    with open(full_path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()

@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
):
    # Make sure the project belongs to this user
    project = await crud.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project["user_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not your project")

    await crud.delete_project(project_id)
    return {"deleted": project_id}

@router.post("/analyses/{analysis_id}/explain")
async def explain_node(
    analysis_id: str,
    body: dict,
    current_user: dict = Depends(get_current_user),
):
    """
    Takes a node_id + its source code snippet,
    sends it to Gemini, returns a plain-English summary.
    """
    node_id   = body.get("node_id", "")
    code      = body.get("code", "")
    node_type = body.get("node_type", "function")

    if not code:
        raise HTTPException(status_code=400, detail="No code provided")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    try:
        client = genai.Client(api_key=api_key)

        prompt = f"""You are a code analysis assistant. Analyze this {node_type} and explain it clearly.

Function/Method name: {node_id}

Source code:
    Provide a concise summary with these sections:
    1. **What it does** — one sentence overview
    2. **Inputs** — what parameters/data it takes (if any)
    3. **Process** — what steps happen inside it
    4. **Output/Effect** — what it returns or what side effect it has
    5. **Calls** — what other functions it calls (if any)

    Keep it short, clear, and developer-friendly. No fluff."""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        summary = response.text if hasattr(response, "text") else str(response)
        return {"summary": summary, "node_id": node_id}

    except Exception as e:
        print(f"Gemini explain error: {e}")
        raise HTTPException(status_code=500, detail=f"Gemini error: {str(e)}")