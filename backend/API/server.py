from fastapi import FastAPI, UploadFile, File
from analizer.main import save_file, extract_project, analyze_project


app = FastAPI()


@app.post("/analyze")  # must be POST
async def analyze(file: UploadFile = File(...)):

    zip_path = save_file(file)

    extract_path = extract_project(zip_path)

    graph = analyze_project(extract_path)

    return graph