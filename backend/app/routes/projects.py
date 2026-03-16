from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.auth import get_current_user
from app.models import AnalysisOut, ProjectOut, AnnotationCreate, AnnotationOut
from app import crud
import sys, os

# Make sure Python can find your analyzer folder
sys.path.append(os.path.join(os.path.dirname(__file__), "../../../analyzer"))
from analyzer.main import (
    save_file, extract_project, analyze_project,
    build_call_graph, build_dependency_graph, graph_to_json,
)

router = APIRouter(tags=["Projects"])


@router.post("/analyze", response_model=AnalysisOut)
async def analyze(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),  # 🔒 must be logged in
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