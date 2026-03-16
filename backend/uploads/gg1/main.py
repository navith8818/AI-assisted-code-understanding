import os
import zipfile
import shutil
import networkx as nx
from tree_sitter import Language, Parser
import tree_sitter_python
import tree_sitter_c
import tree_sitter_cpp



SOURCE_EXTENSIONS = [".py", ".js", ".cpp", ".java"]

UPLOAD_DIR = "uploads"

parsers = {}

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


def extract_functions(node, code, functions):

    if node.type == "function_definition":

        name_node = node.child_by_field_name("name")

        if name_node:
            name = code[name_node.start_byte:name_node.end_byte].decode()
            functions.append(name)

    for child in node.children:
        extract_functions(child, code, functions)

def init_parsers():
    parsers = {}

    # 1. Initialize the Language objects
    PY_LANG = Language(tree_sitter_python.language())
    C_LANG = Language(tree_sitter_c.language())
    CPP_LANG = Language(tree_sitter_cpp.language())

    # 2. Create Parsers by passing the language directly to the constructor
    python_parser = Parser(PY_LANG)
    c_parser = Parser(C_LANG)
    cpp_parser = Parser(CPP_LANG)

    # 3. Map them to your dictionary
    parsers[".py"] = python_parser
    parsers[".c"] = c_parser
    parsers[".h"] = c_parser
    parsers[".cpp"] = cpp_parser
    parsers[".hpp"] = cpp_parser

    return parsers


def analyze_project(project_path: str):

    parser = init_parsers()

    results = []

    for root, dirs, files in os.walk(project_path):

        for file in files:

            if any(file.endswith(ext) for ext in SOURCE_EXTENSIONS):

                filepath = os.path.join(root, file)

                with open(filepath, "rb") as f:
                    code = f.read()

                tree = parser.parse(code)
                functions = []

                extract_functions(tree.root_node, code, functions)

                results.append({
                    "file": filepath,
                    "functions": functions
                })

    return results

