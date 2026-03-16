from tree_sitter import Language, Parser
import tree_sitter_python
import tree_sitter_c
import tree_sitter_cpp

parsers = {}

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