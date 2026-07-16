import os
import zipfile
import shutil
import networkx as nx
from tree_sitter import Language, Parser
import tree_sitter_python
import tree_sitter_c
import tree_sitter_cpp
import tree_sitter_javascript


def _load_language(language_module, language_name):
    try:
        return Language(language_module.language(), language_name)
    except TypeError:
        return Language(language_module.language())

UPLOAD_DIR = "uploads"

# ─────────────────────────────────────────────
# File helpers (unchanged)
# ─────────────────────────────────────────────

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

def init_parsers():
    PY_LANG  = _load_language(tree_sitter_python, "python")
    C_LANG   = _load_language(tree_sitter_c, "c")
    CPP_LANG = _load_language(tree_sitter_cpp, "cpp")
    JS_LANG  = _load_language(tree_sitter_javascript, "javascript")

    py_parser  = Parser(); py_parser.language = PY_LANG
    c_parser   = Parser(); c_parser.language = C_LANG
    cpp_parser = Parser(); cpp_parser.language = CPP_LANG
    js_parser  = Parser(); js_parser.language = JS_LANG

    return {
        ".py":  py_parser,
        ".c":   c_parser,
        ".h":   c_parser,
        ".cpp": cpp_parser,
        ".hpp": cpp_parser,
        ".js":  js_parser,
    }

# ─────────────────────────────────────────────
# C/C++ declarator walker (unchanged)
# ─────────────────────────────────────────────

def get_c_function_name(node, code):
    if node is None:
        return None
    if node.type == "identifier":
        return code[node.start_byte:node.end_byte].decode()
    if node.type in ("function_declarator", "pointer_declarator",
                     "reference_declarator", "abstract_pointer_declarator"):
        return get_c_function_name(node.child_by_field_name("declarator"), code)
    if node.type == "qualified_identifier":
        return get_c_function_name(node.child_by_field_name("name"), code)
    return None

# ─────────────────────────────────────────────
# Symbol table (from previous step - unchanged)
# ─────────────────────────────────────────────

def make_function_entry(file, line):
    return {"file": file, "line": line, "calls": [], "variables": []}

def make_class_entry(file, line):
    return {"file": file, "line": line, "methods": {}, "variables": []}

def extract_defs(node, code, ext, filepath,
                 parent_class=None, scope_stack=None,
                 symbol_table=None, imports=None):
    if symbol_table is None:
        symbol_table = {"functions": {}, "classes": {}, "variables": []}
    if scope_stack is None:
        scope_stack = []
    if imports is None:
        imports = []

    def current_scope():
        return scope_stack[-1] if scope_stack else None

    def add_call(callee):
        scope = current_scope()
        if not scope:
            return
        if "." in scope:
            cls, method = scope.split(".", 1)
            if cls in symbol_table["classes"] and method in symbol_table["classes"][cls]["methods"]:
                symbol_table["classes"][cls]["methods"][method]["calls"].append(callee)
        else:
            if scope in symbol_table["functions"]:
                symbol_table["functions"][scope]["calls"].append(callee)

    def add_variable(name, line):
        entry = {"name": name, "file": filepath, "line": line}
        scope = current_scope()
        if not scope:
            symbol_table["variables"].append(entry)
        elif "." in scope:
            cls, method = scope.split(".", 1)
            if cls in symbol_table["classes"] and method in symbol_table["classes"][cls]["methods"]:
                symbol_table["classes"][cls]["methods"][method].setdefault("variables", []).append(entry)
        else:
            if scope in symbol_table["functions"]:
                symbol_table["functions"][scope].setdefault("variables", []).append(entry)

    line = node.start_point[0] + 1

    if ext == ".py":
        if node.type == "import_statement":
            for child in node.children:
                if child.type == "dotted_name":
                    imports.append(code[child.start_byte:child.end_byte].decode())
        elif node.type == "import_from_statement":
            module_node = node.child_by_field_name("module_name")
            if module_node:
                imports.append(code[module_node.start_byte:module_node.end_byte].decode())
        elif node.type == "class_definition":
            name_node = node.child_by_field_name("name")
            if name_node:
                class_name = code[name_node.start_byte:name_node.end_byte].decode()
                symbol_table["classes"][class_name] = make_class_entry(filepath, line)
                for child in node.children:
                    extract_defs(child, code, ext, filepath, class_name, scope_stack, symbol_table, imports)
            return symbol_table
        elif node.type == "function_definition":
            name_node = node.child_by_field_name("name")
            if name_node:
                name = code[name_node.start_byte:name_node.end_byte].decode()
                if parent_class:
                    symbol_table["classes"][parent_class]["methods"][name] = make_function_entry(filepath, line)
                    qualified = f"{parent_class}.{name}"
                else:
                    symbol_table["functions"][name] = make_function_entry(filepath, line)
                    qualified = name
                scope_stack.append(qualified)
                for child in node.children:
                    extract_defs(child, code, ext, filepath, parent_class, scope_stack, symbol_table, imports)
                scope_stack.pop()
            return symbol_table
        elif node.type in ("call", "call_expression"):
            fn_node = node.child_by_field_name("function")
            if fn_node:
                add_call(code[fn_node.start_byte:fn_node.end_byte].decode())
        elif node.type == "assignment":
            target = node.child_by_field_name("left")
            if target and target.type == "identifier":
                add_variable(code[target.start_byte:target.end_byte].decode(), line)

    elif ext in (".c", ".h", ".cpp", ".hpp", ".js"):
        if node.type == "import_statement":
            src = node.child_by_field_name("source")
            if src:
                imports.append(code[src.start_byte:src.end_byte].decode().strip('"\''))
        elif node.type in ("class_specifier", "class_definition", "class_declaration"):
            name_node = node.child_by_field_name("name")
            if name_node:
                class_name = code[name_node.start_byte:name_node.end_byte].decode()
                symbol_table["classes"][class_name] = make_class_entry(filepath, line)
                for child in node.children:
                    extract_defs(child, code, ext, filepath, class_name, scope_stack, symbol_table, imports)
            return symbol_table
        elif node.type in ("function_definition", "function_declaration"):
            name_node = node.child_by_field_name("name")
            name = (code[name_node.start_byte:name_node.end_byte].decode()
                    if name_node else get_c_function_name(node.child_by_field_name("declarator"), code))
            if name:
                if parent_class:
                    symbol_table["classes"][parent_class]["methods"][name] = make_function_entry(filepath, line)
                    qualified = f"{parent_class}.{name}"
                else:
                    symbol_table["functions"][name] = make_function_entry(filepath, line)
                    qualified = name
                scope_stack.append(qualified)
                for child in node.children:
                    extract_defs(child, code, ext, filepath, parent_class, scope_stack, symbol_table, imports)
                scope_stack.pop()
            return symbol_table
        elif node.type == "method_definition":
            name_node = node.child_by_field_name("name")
            if name_node:
                name = code[name_node.start_byte:name_node.end_byte].decode()
                if parent_class:
                    symbol_table["classes"][parent_class]["methods"][name] = make_function_entry(filepath, line)
                    qualified = f"{parent_class}.{name}"
                else:
                    symbol_table["functions"][name] = make_function_entry(filepath, line)
                    qualified = name
                scope_stack.append(qualified)
                for child in node.children:
                    extract_defs(child, code, ext, filepath, parent_class, scope_stack, symbol_table, imports)
                scope_stack.pop()
            return symbol_table
        elif node.type in ("call_expression", "call"):
            fn_node = node.child_by_field_name("function")
            if fn_node:
                add_call(code[fn_node.start_byte:fn_node.end_byte].decode())
        elif node.type == "lexical_declaration":
            for child in node.children:
                if child.type == "variable_declarator":
                    id_node = child.child_by_field_name("name")
                    if id_node:
                        add_variable(code[id_node.start_byte:id_node.end_byte].decode(), line)

    for child in node.children:
        extract_defs(child, code, ext, filepath, parent_class, scope_stack, symbol_table, imports)

    return symbol_table


# ═══════════════════════════════════════════════════════
# NEW: DEPENDENCY GRAPH
# ═══════════════════════════════════════════════════════

def build_dependency_graph(symbol_table: dict, project_path: str) -> nx.DiGraph:
    """
    File-level import dependency graph.
    Nodes  = relative file paths (only files in the project)
    Edges  = file A imports file B  →  A → B

    External stdlib imports (os, sys, react, etc.) are included as
    separate nodes so the frontend can optionally show or hide them.
    """
    G = nx.DiGraph()

    # Collect all known project files so we can tag external vs internal
    project_files = set(symbol_table.get("imports", {}).keys())

    for filepath, modules in symbol_table.get("imports", {}).items():
        G.add_node(filepath, type="file", external=False,
                   label=os.path.basename(filepath))

        for mod in modules:
            # Resolve relative Python imports like ".utils" → "utils"
            mod_clean = mod.lstrip(".")

            # Try to match mod to a known project file
            matched_file = _resolve_import_to_file(mod_clean, project_files, project_path)

            if matched_file:
                # Internal dependency
                if matched_file not in G:
                    G.add_node(matched_file, type="file", external=False,
                               label=os.path.basename(matched_file))
                G.add_edge(filepath, matched_file, kind="internal")
            else:
                # External library (os, sys, fastapi, react…)
                ext_id = f"[ext] {mod_clean}"
                if ext_id not in G:
                    G.add_node(ext_id, type="library", external=True, label=mod_clean)
                G.add_edge(filepath, ext_id, kind="external")

    return G


def _resolve_import_to_file(module_name: str, project_files: set, project_path: str) -> str | None:
    """
    Try to map a module name like 'analyzer.main' or 'utils'
    to a file path that exists in project_files.
    """
    # Convert dotted module name to path segments: "analyzer.main" → "analyzer/main"
    as_path = module_name.replace(".", os.sep)

    candidates = [
        as_path + ".py",
        as_path + ".js",
        as_path + os.sep + "__init__.py",
        as_path + ".ts",
    ]

    for candidate in candidates:
        # Check both exact match and suffix match (handles different root prefixes)
        for known in project_files:
            if known == candidate or known.endswith(os.sep + candidate):
                return known
    return None


# ═══════════════════════════════════════════════════════
# NEW: CONTROL FLOW GRAPH
# ═══════════════════════════════════════════════════════

# Node types that represent control flow branching/looping
_CFG_BRANCH_NODES = {
    # Python
    "if_statement", "elif_clause", "else_clause",
    "for_statement", "while_statement",
    "try_statement", "except_clause", "finally_clause",
    "with_statement", "match_statement", "case_clause",
    # C / C++ / JS
    "if_statement", "else_clause",
    "for_statement", "while_statement", "do_statement",
    "switch_statement", "case_statement", "default_statement",
    "try_statement", "catch_clause", "finally_clause",
}

_CFG_EXIT_NODES = {
    "return_statement", "break_statement",
    "continue_statement", "raise_statement",
    "throw_statement",
}


def build_cfg_for_function(func_node, code: bytes, func_name: str) -> nx.DiGraph:
    """
    Build a Control Flow Graph for a single function's AST node.

    Each node in the graph has:
        id       — unique string  e.g. "func_name:if_statement:42"
        label    — short human-readable description
        kind     — "entry" | "exit" | "statement" | "branch" | "loop" | "return"
        line     — source line number
        code_snippet — up to 60 chars of the source text
    """
    G = nx.DiGraph()
    counter = {"n": 0}

    def new_id(kind: str, line: int) -> str:
        counter["n"] += 1
        return f"{func_name}:{kind}:{line}:{counter['n']}"

    def snippet(node) -> str:
        raw = code[node.start_byte:node.end_byte].decode(errors="replace")
        single = raw.replace("\n", " ").strip()
        return single[:60] + ("…" if len(single) > 60 else "")

    # ENTRY node
    entry_id = new_id("entry", func_node.start_point[0] + 1)
    G.add_node(entry_id, kind="entry", label="ENTRY",
               line=func_node.start_point[0] + 1, code_snippet="")

    # EXIT node (we'll always have one; returns will also point here)
    exit_id = new_id("exit", func_node.end_point[0] + 1)
    G.add_node(exit_id, kind="exit", label="EXIT",
               line=func_node.end_point[0] + 1, code_snippet="")

    # We walk the *body* of the function, not the whole function node
    body_node = func_node.child_by_field_name("body")
    if body_node is None:
        # C: body is a compound_statement child, not a named field
        for child in func_node.children:
            if child.type == "compound_statement":
                body_node = child
                break

    if body_node is None:
        G.add_edge(entry_id, exit_id)
        return G

    # Walk the body and link nodes linearly,
    # branching at if/for/while etc.
    last_ids = _walk_cfg(body_node, code, G, new_id, snippet, exit_id)

    # Connect entry → first real node
    body_children = [c for c in body_node.children
                     if c.type not in ("{", "}", ":", "comment")]
    if body_children:
        first_line = body_children[0].start_point[0] + 1
        # Find nodes at that line
        first_nodes = [n for n, d in G.nodes(data=True) if d.get("line") == first_line]
        if first_nodes:
            G.add_edge(entry_id, first_nodes[0])
        else:
            G.add_edge(entry_id, exit_id)
    else:
        G.add_edge(entry_id, exit_id)

    # Connect dangling tails → exit
    for nid in last_ids:
        if nid != exit_id:
            G.add_edge(nid, exit_id)

    return G


def _walk_cfg(body_node, code: bytes, G: nx.DiGraph,
              new_id, snippet, exit_id: str) -> list[str]:
    """
    Recursively walk a block of statements, add CFG nodes, and return
    the list of 'tail' node-ids that need to connect to whatever comes next.
    """
    prev_ids = []   # ids whose outgoing edge is not yet connected
    skip_types = {"{", "}", ":", "comment", "parameters", "type_parameters"}

    for child in body_node.children:
        if child.type in skip_types:
            continue

        line = child.start_point[0] + 1

        # ── Return / raise / break / continue ──────────────────────────────
        if child.type in _CFG_EXIT_NODES:
            nid = new_id(child.type, line)
            kind = child.type.replace("_statement", "")
            G.add_node(nid, kind=kind, label=kind,
                       line=line, code_snippet=snippet(child))
            for pid in prev_ids:
                G.add_edge(pid, nid)
            G.add_edge(nid, exit_id)
            prev_ids = []   # nothing follows an unconditional exit

        # ── If / elif / else ────────────────────────────────────────────────
        elif child.type == "if_statement":
            cond_node = child.child_by_field_name("condition")
            cond_text = snippet(cond_node) if cond_node else "condition"
            nid = new_id("if", line)
            G.add_node(nid, kind="branch", label=f"if {cond_text}",
                       line=line, code_snippet=snippet(child))
            for pid in prev_ids:
                G.add_edge(pid, nid)

            tails = []
            # true branch
            true_body = child.child_by_field_name("consequence") or \
                        child.child_by_field_name("body")
            if true_body:
                t_tails = _walk_cfg(true_body, code, G, new_id, snippet, exit_id)
                for t in t_tails or [nid]:
                    G.add_edge(nid, t) if t == (t_tails or [nid])[0] else None
                # connect branch node → first in true branch
                true_first = _first_node_in_block(true_body, G)
                if true_first:
                    G.add_edge(nid, true_first)
                tails.extend(t_tails)
            else:
                tails.append(nid)

            # false / else branch
            alt_body = child.child_by_field_name("alternative")
            if alt_body:
                false_first = _first_node_in_block(alt_body, G)
                if false_first:
                    G.add_edge(nid, false_first)
                f_tails = _walk_cfg(alt_body, code, G, new_id, snippet, exit_id)
                tails.extend(f_tails)
            else:
                tails.append(nid)  # fall through on no-else

            prev_ids = tails

        # ── For / while loop ────────────────────────────────────────────────
        elif child.type in ("for_statement", "while_statement", "do_statement"):
            kind = child.type.split("_")[0]
            cond_node = child.child_by_field_name("condition") or \
                        child.child_by_field_name("left")
            cond_text = snippet(cond_node) if cond_node else "condition"
            nid = new_id(kind, line)
            G.add_node(nid, kind="loop", label=f"{kind} {cond_text}",
                       line=line, code_snippet=snippet(child))
            for pid in prev_ids:
                G.add_edge(pid, nid)

            loop_body = child.child_by_field_name("body")
            if loop_body:
                body_first = _first_node_in_block(loop_body, G)
                if body_first:
                    G.add_edge(nid, body_first)
                body_tails = _walk_cfg(loop_body, code, G, new_id, snippet, exit_id)
                for bt in body_tails:
                    G.add_edge(bt, nid)  # loop back edge

            prev_ids = [nid]  # exit path from loop

        # ── Try / except ────────────────────────────────────────────────────
        elif child.type in ("try_statement",):
            nid = new_id("try", line)
            G.add_node(nid, kind="branch", label="try",
                       line=line, code_snippet="try block")
            for pid in prev_ids:
                G.add_edge(pid, nid)

            tails = []
            try_body = child.child_by_field_name("body")
            if try_body:
                tb_first = _first_node_in_block(try_body, G)
                if tb_first:
                    G.add_edge(nid, tb_first)
                tails.extend(_walk_cfg(try_body, code, G, new_id, snippet, exit_id))

            for clause in child.children:
                if clause.type in ("except_clause", "except_handler",
                                   "catch_clause", "finally_clause"):
                    cl_nid = new_id(clause.type, clause.start_point[0] + 1)
                    label = clause.type.replace("_clause", "").replace("_handler", "")
                    G.add_node(cl_nid, kind="branch", label=label,
                               line=clause.start_point[0] + 1, code_snippet=snippet(clause))
                    G.add_edge(nid, cl_nid)
                    cl_body = clause.child_by_field_name("body")
                    if cl_body:
                        cb_first = _first_node_in_block(cl_body, G)
                        if cb_first:
                            G.add_edge(cl_nid, cb_first)
                        tails.extend(_walk_cfg(cl_body, code, G, new_id, snippet, exit_id))
                    else:
                        tails.append(cl_nid)

            prev_ids = tails if tails else [nid]

        # ── Regular statement ────────────────────────────────────────────────
        else:
            nid = new_id(child.type, line)
            G.add_node(nid, kind="statement",
                       label=child.type.replace("_statement", "").replace("_", " "),
                       line=line, code_snippet=snippet(child))
            for pid in prev_ids:
                G.add_edge(pid, nid)
            prev_ids = [nid]

    return prev_ids


def _first_node_in_block(block_node, G: nx.DiGraph):
    """Return the first CFG node id that lives at the block's starting line."""
    if block_node is None:
        return None
    start_line = block_node.start_point[0] + 1
    candidates = [n for n, d in G.nodes(data=True)
                  if d.get("line", -1) >= start_line]
    if not candidates:
        return None
    return min(candidates, key=lambda n: G.nodes[n].get("line", 9999))


def build_all_cfgs(symbol_table: dict, project_path: str) -> dict:
    """
    Build a CFG for every function and method in the symbol table.
    Returns a dict:  { "func_name": graph_to_json(G), ... }
    """
    parsers = init_parsers()
    cfgs = {}

    # We need the original AST nodes — re-parse the files
    for root, dirs, files in os.walk(project_path):
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext not in parsers:
                continue

            filepath = os.path.join(root, file)
            rel_path = os.path.relpath(filepath, project_path)
            with open(filepath, "rb") as f:
                code = f.read()

            tree = parsers[ext].parse(code)
            _extract_cfgs_from_tree(tree.root_node, code, ext, rel_path,
                                    symbol_table, cfgs)

    return cfgs


def _extract_cfgs_from_tree(node, code: bytes, ext: str, filepath: str,
                             symbol_table: dict, cfgs: dict):
    """Walk the AST, find function nodes, build CFG for each."""
    func_node_types = {"function_definition", "function_declaration", "method_definition"}

    if node.type in func_node_types:
        name_node = node.child_by_field_name("name")
        name = None
        if name_node:
            name = code[name_node.start_byte:name_node.end_byte].decode()
        else:
            name = get_c_function_name(node.child_by_field_name("declarator"), code)

        if name and (name in symbol_table["functions"] or
                     any(name in cls["methods"]
                         for cls in symbol_table["classes"].values())):
            G = build_cfg_for_function(node, code, name)
            cfgs[name] = graph_to_json(G)
            return  # don't recurse into nested functions

    for child in node.children:
        _extract_cfgs_from_tree(child, code, ext, filepath, symbol_table, cfgs)


# ═══════════════════════════════════════════════════════
# Existing graph builders (with external filter)
# ═══════════════════════════════════════════════════════

STDLIB_PREFIXES = {
    "os", "sys", "re", "json", "math", "time", "datetime", "pathlib",
    "collections", "itertools", "functools", "typing", "logging",
    "subprocess", "threading", "asyncio", "unittest", "io", "abc",
    "printf", "scanf", "malloc", "free", "memcpy", "strlen",
    "console", "Math", "JSON", "Promise", "Array", "Object",
}

def is_user_defined(name, symbol_table):
    base = name.split(".")[0]
    return (name in symbol_table["functions"]
            or base in symbol_table["classes"]
            or any(name in cls["methods"]
                   for cls in symbol_table["classes"].values()))

def build_call_graph(symbol_table, filter_external=True):
    G = nx.DiGraph()
    for func, info in symbol_table["functions"].items():
        G.add_node(func, type="function", file=info.get("file",""), line=info.get("line",0))
    for cls, cls_info in symbol_table["classes"].items():
        G.add_node(cls, type="class", file=cls_info.get("file",""), line=cls_info.get("line",0))
        for method, m_info in cls_info["methods"].items():
            G.add_node(f"{cls}.{method}", type="method",
                       file=m_info.get("file",""), line=m_info.get("line",0))
    def add_edges(caller, calls):
        for callee in calls:
            if filter_external:
                if callee.split(".")[0] in STDLIB_PREFIXES:
                    continue
                if not is_user_defined(callee, symbol_table):
                    continue
            G.add_edge(caller, callee)
    for func, info in symbol_table["functions"].items():
        add_edges(func, info["calls"])
    for cls, cls_info in symbol_table["classes"].items():
        for method, m_info in cls_info["methods"].items():
            add_edges(f"{cls}.{method}", m_info["calls"])
    return G

def graph_to_json(G: nx.DiGraph) -> dict:
    nodes = [{"data": {"id": n, **G.nodes[n]}} for n in G.nodes]
    edges = [{"data": {"source": u, "target": v, **G.edges[u,v]}}
             for u, v in G.edges]
    return {"nodes": nodes, "edges": edges}

def analyze_project(project_path: str):
    parsers = init_parsers()
    symbol_table = {"functions": {}, "classes": {}, "variables": []}
    all_imports = {}

    for root, dirs, files in os.walk(project_path):
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext not in parsers:
                continue
            filepath = os.path.join(root, file)
            rel_path = os.path.relpath(filepath, project_path)
            with open(filepath, "rb") as f:
                code = f.read()
            tree = parsers[ext].parse(code)
            file_imports = []
            extract_defs(tree.root_node, code, ext,
                         filepath=rel_path,
                         symbol_table=symbol_table,
                         imports=file_imports)
            all_imports[rel_path] = file_imports

    symbol_table["imports"] = all_imports
    return symbol_table