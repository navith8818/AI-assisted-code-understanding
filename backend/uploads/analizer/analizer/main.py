import os
import zipfile
import shutil
import networkx as nx

SOURCE_EXTENSIONS = [".py", ".js", ".cpp", ".java"]

UPLOAD_DIR = "uploads"

def save_file(file):
    
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filepath = os.path.join(UPLOAD_DIR, file.filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return filepath

def extract_project(zip_path):
    filename_only = os.path.basename(zip_path).replace(".zip", "")
    extract_path = os.path.join(UPLOAD_DIR, filename_only)

    os.makedirs(extract_path, exist_ok=True)
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(extract_path)
    return extract_path

def analyze_project(project_path: str):

    G = nx.DiGraph()

    # scan project files
    for root, dirs, files in os.walk(project_path):

        for file in files:

            if any(file.endswith(ext) for ext in SOURCE_EXTENSIONS):

                filepath = os.path.join(root, file)

                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    lines = f.readlines()

                # very simple "function detection" for testing
                for line in lines:

                    if "def " in line or "function " in line:

                        name = line.strip().split()[1].split("(")[0]

                        G.add_node(name)

    # build dummy edges (temporary)
    nodes = list(G.nodes)

    for i in range(len(nodes) - 1):
        G.add_edge(nodes[i], nodes[i+1])

    return graph_to_json(G)


def graph_to_json(G):

    nodes = [{"data": {"id": n}} for n in G.nodes]
    edges = [{"data": {"source": u, "target": v}} for u, v in G.edges]

    return {
        "nodes": nodes,
        "edges": edges
    }