"""
Knowledge base for the AI-assisted Code Understanding platform.
Contains comprehensive information about FlowGen and the project.
"""

KNOWLEDGE_BASE = """
# AI-Assisted Code Understanding Platform - Knowledge Base

## Project Overview
This is an AI-powered code analysis and visualization platform that helps developers understand complex codebases through intelligent analysis and interactive visualization.

## FlowGen - Flow Visualization & Generation System

### What is FlowGen?
FlowGen is the core visualization engine that automatically generates and displays code flow diagrams. It transforms static code into interactive, visual representations of how components interact with each other.

### FlowGen Features:
1. **Automated Flow Generation**: Automatically parses and processes source code to extract flow information
2. **Call Graph Visualization**: Shows function/method calls and their relationships
3. **Dependency Graphs**: Visualizes module and package dependencies
4. **Multi-Language Support**: Supports Python, JavaScript, C, C++, and Java through tree-sitter
5. **Symbol Table Analysis**: Extracts and indexes functions, classes, variables, and their definitions
6. **Interactive Dashboard**: Provides an intuitive interface to explore code flows

### How It Works:
1. User uploads a code project (ZIP file)
2. FlowGen extracts and parses the project files
3. Tree-sitter generates accurate Abstract Syntax Trees (ASTs)
4. Symbol analysis builds a complete symbol table
5. Call graphs are constructed showing function relationships
6. Dependency graphs display module/package connections
7. All data is converted to JSON for visualization
8. Results are displayed in an interactive dashboard

### Key Technologies:
- **Tree-sitter**: Industry-standard parsing library
- **NetworkX**: Graph analysis and visualization
- **FastAPI**: High-performance backend API
- **MongoDB**: Scalable data storage
- **React**: Dynamic frontend with visualization

## Core Features

### 1. Code Upload & Analysis
- Upload individual files or entire projects
- Automatic extraction and preprocessing
- Support for multiple programming languages
- Incremental parsing for large projects

### 2. Structure Analysis
- Extract all symbols (functions, classes, variables)
- Build comprehensive symbol tables
- Identify function calls and relationships
- Track dependencies between modules

### 3. Visualization
- Interactive call graphs showing function relationships
- Dependency graphs for module structure
- Color-coded nodes and edges
- Zoom, pan, and filter capabilities

### 4. Annotations
- Add custom notes to code nodes
- Color-code important sections
- Save annotations for future reference
- Share analysis findings with team members

### 5. User Management
- Secure authentication with JWT tokens
- Project history and saved analyses
- Personal dashboard with analytics
- User-specific data isolation

## Supported Languages
- Python (*.py)
- JavaScript/TypeScript (*.js, *.ts)
- C (*.c, *.h)
- C++ (*.cpp, *.cc, *.cxx, *.h, *.hpp)
- Java (*.java) - coming soon

## Use Cases
1. **Onboarding**: New developers can quickly understand project structure
2. **Refactoring**: Identify dependencies before making changes
3. **Bug Tracking**: Trace function calls to find root causes
4. **Documentation**: Auto-generate architecture diagrams
5. **Code Review**: Understand impact of proposed changes
6. **Maintenance**: Keep track of complex legacy code

## Backend Architecture
- **FastAPI Framework**: Modern, fast Python web framework
- **MongoDB Database**: Flexible document storage
- **Motor (Async Driver)**: Non-blocking database operations
- **JWT Authentication**: Secure token-based auth
- **CORS Support**: Cross-origin requests handled safely

## API Endpoints

### Projects
- `POST /analyze` - Upload and analyze a code project
- `GET /projects` - List user's projects
- `GET /projects/{id}/analyses` - Get analyses for a project
- `GET /analyses/{id}` - Get specific analysis details
- `GET /analyses/{id}/file` - Get source file contents

### Annotations
- `POST /analyses/{id}/annotations` - Add annotation to analysis
- `GET /analyses/{id}/annotations` - Get all annotations
- `DELETE /annotations/{id}` - Remove annotation

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Authenticate user
- `POST /auth/logout` - End session

## Frontend Components
- **ChatBot**: AI assistant for help and guidance
- **Dashboard**: Main interface for viewing analyses
- **CodeViewer**: Display source code with syntax highlighting
- **FilterControls**: Search and filter nodes in graphs
- **VisualizationCanvas**: Interactive graph rendering

## Getting Started
1. Register for an account
2. Upload a code project (as ZIP)
3. Wait for analysis to complete
4. Explore the interactive FlowGen visualizations
5. Add annotations for important findings
6. Export or share your analysis

## Performance
- Fast incremental parsing for large codebases
- Typical analysis time: 5-30 seconds depending on project size
- Optimized graph algorithms for responsive interaction
- Caching for frequently accessed analyses

## Security
- Password hashing with bcrypt
- JWT token-based authentication
- HTTPS ready
- User data isolation
- Upload validation and scanning
"""

def get_knowledge_base():
    """Returns the complete knowledge base."""
    return KNOWLEDGE_BASE

def get_flowgen_summary():
    """Returns a brief summary of FlowGen for quick reference."""
    return """
FlowGen is the automatic code flow visualization engine at the heart of this platform. 
It analyzes your source code and generates interactive diagrams showing:
- How functions call each other (call graphs)
- How modules and packages connect (dependency graphs)
- The complete structure of your codebase

FlowGen supports Python, JavaScript, C, C++, and more using advanced parsing technology.
Simply upload your code, and FlowGen instantly creates visual maps to help you understand, debug, and refactor.
"""

def get_project_features():
    """Returns list of main project features."""
    return [
        "Upload and analyze code projects",
        "Automatic call graph generation (FlowGen)",
        "Dependency graph visualization",
        "Symbol table extraction",
        "Code annotations and markup",
        "Multi-language support (Python, JS, C, C++)",
        "Interactive dashboard",
        "Project history and saved analyses",
        "Secure user authentication"
    ]

def is_relevant_to_project(query: str) -> bool:
    """Check if a query is related to this project."""
    keywords = [
        "flowgen", "upload", "analyze", "code", "graph", "dependency",
        "function", "structure", "dashboard", "visualization", "project",
        "parse", "symbol", "call", "flow", "feature", "support"
    ]
    query_lower = query.lower()
    return any(keyword in query_lower for keyword in keywords)
