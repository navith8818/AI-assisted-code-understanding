# FlowGen — AI-Assisted Code Architecture & Flow Visualizer

FlowGen is an interactive, AI-powered codebase visualization platform. It parses source code repositories and archives using **Tree-sitter**, extracts symbol tables, builds **Call Graphs**, **Dependency Graphs**, and **Control Flow Graphs (CFGs)**, provides Gemini-powered AI code explanations, and persists user analyses in **MongoDB**.

---

## Table of Contents

- [Overview & Key Features](#overview--key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Deployment & Running Guide](#deployment--running-guide)
  - [1. Docker Deployment (Production — Recommended)](#1-docker-deployment-production--recommended)
  - [2. Docker Development (With Hot Reloading)](#2-docker-development-with-hot-reloading)
  - [3. Local Native Development (Without Docker)](#3-local-native-development-without-docker)
  - [4. Production Cloud Deployment (VPS / AWS / GCP / DigitalOcean)](#4-production-cloud-deployment-vps--aws--gcp--digitalocean)
- [Environment Variables Reference](#environment-variables-reference)
- [API Endpoints Reference](#api-endpoints-reference)
- [Project Structure](#project-structure)
- [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Overview & Key Features

- **Multi-Language AST Parsing**: Supports Python (`.py`), JavaScript (`.js`), C (`.c`, `.h`), and C++ (`.cpp`, `.hpp`) via high-performance Tree-sitter grammars.
- **Automated Graph Generation**:
  - **Call Graphs**: Function-to-function invocation topologies.
  - **Dependency Graphs**: Module-to-module import and package links.
  - **Control Flow Graphs (CFGs)**: Per-function branch and loop decision nodes.
- **Interactive Visualizer**: Powered by Cytoscape.js with Dagre layout, zoom, pan, node isolation, and neighbor highlighting.
- **In-App Code Viewer**: Inspect raw source code with line navigation directly alongside graphs.
- **AI Code Explanations**: Click any node to generate structured plain-English summaries via Google Gemini (`gemini-2.5-flash`).
- **Complete Authentication System**: User registration, login, and profile verification using JWT tokens, bcrypt password hashing, and user data isolation.
- **Persistent Analyzer History**: Projects, symbol tables, and generated graphs are stored in MongoDB. Clicking past projects loads their graphs instantly without re-analyzing.
- **History Search & Management**: Filter past analyzers in real time, view relative timestamps, and delete obsolete analyses.
- **Collapsible Sidebar**: One-click minimization into a compact icon rail with persisted state.
- **FlowGen Chatbot**: Integrated AI assistant answering questions about your codebase and the platform.

---

## System Architecture

```
                                  ┌────────────────────────┐
                                  │   Client / Browser     │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                      ┌────────────────────────────────────────────────┐
                      │              Nginx Web Server                  │
                      │          (Port 80 ➔ Host 5173/3000)            │
                      └───────────────┬────────────────┬───────────────┘
                                      │                │
                        Static Assets │                │ Proxy /api, /auth, /chat
                                      ▼                ▼
                             ┌────────────────┐ ┌───────────────────────────┐
                             │ React SPA      │ │ FastAPI Backend (Uvicorn) │
                             │ (Vite Build)   │ │ (Port 8000)               │
                             └────────────────┘ └─────────────┬─────────────┘
                                                              │
                                            Motor Async Driver│
                                                              ▼
                                                ┌───────────────────────────┐
                                                │   MongoDB 7.0 Database    │
                                                │   (Port 27017)            │
                                                └───────────────────────────┘
```

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Cytoscape.js, Cytoscape-Dagre, Modern CSS3 |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Tree-sitter, NetworkX, Motor, Pydantic v2 |
| **Database** | MongoDB 7.0 (Collections: `users`, `projects`, `analyses`, `annotations`, `bookings`) |
| **AI Integration** | Google GenAI SDK (`google-genai`), Gemini 2.5 Flash |
| **Auth / Security** | JSON Web Tokens (`python-jose`), `bcrypt` password hashing |
| **DevOps / Container** | Docker, Docker Compose, Nginx, Multi-stage builds |

---

## Prerequisites

### For Docker Deployment (Recommended)
- **Docker Engine**: version 20.10+
- **Docker Compose**: version 2.0+ (or Docker Desktop on Windows/macOS)

### For Native Local Development
- **Node.js**: version 18.x or 20.x
- **Python**: version 3.10 or 3.11
- **MongoDB**: version 6.0+ or 7.0+ (running locally on port `27017`)
- **Git CLI**: installed and available on `PATH` (for Git repo analysis)
- **C/C++ Compiler**: GCC / Clang / MSVC (required by Tree-sitter)

---

## Environment Configuration

Copy the example environment configuration to configure your local setup:

```bash
# Root environment file (used by Docker Compose)
cp .env.example .env

# Backend environment file (used when running natively)
cp backend/.env.example backend/.env
```

### Key Environment Variables
```ini
# MongoDB Connection
MONGODB_URL=mongodb://127.0.0.1:27017
DB_NAME=codeanalyzer

# JWT Authentication
SECRET_KEY=your_strong_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Google Gemini API Key (Optional — for AI explanations and chatbot)
# Get a free key at: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# App Environment
ENVIRONMENT=production
```

---

## Deployment & Running Guide

### 1. Docker Deployment (Production — Recommended)

This spins up the entire multi-container stack (**Frontend with Nginx**, **FastAPI Backend**, and **MongoDB**) with automated health checks and persistent volumes.

```bash
# 1. Clone the repository
git clone https://github.com/navith8818/Flowgen.git
cd Flowgen

# 2. Configure environment (optional)
cp .env.example .env

# 3. Build and launch all containers in detached mode
docker compose up -d --build
```

#### Access Points:
- **Web Application**: [http://localhost:5173](http://localhost:5173) or [http://localhost:3000](http://localhost:3000)
- **Backend API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **MongoDB**: `mongodb://localhost:27017`

#### Managing the Docker Deployment:
```bash
# Check running containers and health status
docker compose ps

# View live consolidated logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# Stop the containers
docker compose down

# Stop containers and erase database volumes (Fresh Reset)
docker compose down -v
```

---

### 2. Docker Development (With Hot Reloading)

If you are developing inside Docker and want live changes in `frontend/src/` and `backend/` to immediately reflect without rebuilding images:

```bash
docker compose -f docker-compose.dev.yml up --build
```

---

### 3. Local Native Development (Without Docker)

Follow these steps to run the backend, frontend, and database directly on your host machine.

#### Step 3.1: Start MongoDB
Ensure MongoDB is running on `localhost:27017`:
```bash
# Windows (PowerShell)
Get-Service -Name MongoDB | Start-Service

# Linux (systemd)
sudo systemctl start mongod

# macOS (Homebrew)
brew services start mongodb-community
```

#### Step 3.2: Setup & Start Backend
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Windows (CMD):
.venv\Scripts\activate.bat
# Linux / macOS:
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run FastAPI backend with Uvicorn
uvicorn server:app --reload --port 8000
```
*Backend is now running at `http://localhost:8000`.*

#### Step 3.3: Setup & Start Frontend
In a separate terminal window:
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend is now running at `http://localhost:5173`.*

---

### 4. Production Cloud Deployment (VPS / AWS / GCP / DigitalOcean)

To deploy FlowGen to a Linux cloud virtual machine (Ubuntu 22.04 / 24.04 LTS):

#### Step 4.1: Server Preparation
```bash
# Update packages and install Docker + Git
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y git curl ca-certificates

# Install Docker & Docker Compose plugin
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

#### Step 4.2: Clone & Configure
```bash
git clone https://github.com/navith8818/Flowgen.git /opt/flowgen
cd /opt/flowgen

# Create production .env file
cp .env.example .env
nano .env # Set your GEMINI_API_KEY and a secure SECRET_KEY
```

#### Step 4.3: Deploy Containers
```bash
docker compose up -d --build
```

#### Step 4.4: (Optional) Setup Domain & HTTPS with Certbot
If pointing a domain (e.g., `flowgen.yourdomain.com`) to your server:
1. Install Nginx and Certbot on host:
   ```bash
   sudo apt-get install -y nginx certbot python3-certbot-nginx
   ```
2. Configure `/etc/nginx/sites-available/flowgen`:
   ```nginx
   server {
       server_name flowgen.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:5173;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           client_max_body_size 100M;
       }
   }
   ```
3. Enable and secure with SSL:
   ```bash
   sudo ln -s /etc/nginx/sites-available/flowgen /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d flowgen.yourdomain.com
   ```

---

## Environment Variables Reference

| Variable | Scope | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `MONGODB_URL` | Backend | `mongodb://mongodb:27017` (Docker) / `mongodb://127.0.0.1:27017` (Local) | Connection string for MongoDB |
| `DB_NAME` | Backend | `codeanalyzer` | Target database name |
| `SECRET_KEY` | Backend | `thisissomethinglongandsecret123456` | Secret key used for signing JWT access tokens |
| `ALGORITHM` | Backend | `HS256` | JWT encryption algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Backend | `60` | Token expiration time in minutes |
| `GEMINI_API_KEY` | Backend | *None* | Google AI Studio API key for AI summaries & chat |
| `ENVIRONMENT` | Backend | `production` | Set to `development` or `production` |
| `VITE_API_BASE_URL` | Frontend | `''` (Prod / Nginx) / `http://localhost:8000` (Dev) | API base URL override if hosting backend on another domain |

---

## API Endpoints Reference

### Health & System
- `GET /api/health` — Checks service status and verifies MongoDB connectivity.

### Code Analysis & Projects
- `POST /api/upload-zip` — Upload and extract a `.zip` codebase, triggers full AST parsing, call graph, and dependency graph generation.
- `POST /api/analyze-git` — Clones a remote Git repository (`url`) and executes full architecture analysis.
- `GET /api/projects` — Retrieves list of past analyzed projects from MongoDB (supports `?search=query`).
- `GET /api/projects/{id}/analysis` — Loads full analysis data for a past project into the visualizer.
- `DELETE /api/projects/{id}` — Deletes a project and its analyses from MongoDB.
- `POST /api/file-content` — Retrieves the raw source text of a specific file inside an analyzed project.
- `POST /api/explain` — Generates a concise AI summary for a selected code node (function, class, method).

### Authentication
- `POST /auth/register` — Creates a new user with hashed password.
- `POST /auth/login` — Verifies user credentials and returns a JWT bearer token.
- `GET /auth/me` — Returns authenticated user details (requires `Bearer <token>`).

### AI Assistant & Bookings
- `POST /chat` — Conversational assistant contextualized with FlowGen knowledge base.
- `GET /chat/features` — Returns platform features list.
- `GET /bookings/slots` — Returns available live demo slots.
- `POST /bookings/book` — Books a live demo slot.

---

## Project Structure

```
Flowgen/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth.py          # /auth/register, /auth/login, /auth/me
│   │   │   ├── projects.py      # Core analysis and file endpoints
│   │   │   ├── chat.py          # Gemini AI chat routes
│   │   │   └── bookings.py      # Demo booking endpoints
│   │   ├── auth.py              # JWT tokens & bcrypt password hashing
│   │   ├── crud.py              # Async MongoDB database operations
│   │   ├── database.py          # Motor MongoDB connection & collection handles
│   │   ├── knowledge_base.py    # System knowledge base for chatbot
│   │   └── models.py            # Pydantic schemas and validators
│   ├── API/
│   │   └── server.py            # Alternative server entrypoint
│   ├── uploads/                 # Temporary extracted repositories & archives
│   ├── Dockerfile               # Backend Docker container specification
│   ├── .dockerignore            # Backend Docker ignore list
│   ├── main.py                  # Tree-sitter parsers, AST, CFG & graph engines
│   ├── server.py                # Main FastAPI application entrypoint
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── assets/              # SVG logos and icons
│   │   ├── components/
│   │   │   ├── AuthModal.jsx    # Glassmorphic Login & Registration modal
│   │   │   ├── ChatBar.jsx      # Bottom command & git input bar
│   │   │   ├── CodeViewer.jsx   # Source code viewing panel with line highlights
│   │   │   ├── DashboardView.jsx# Main workspace with split view & controls
│   │   │   ├── DropZone.jsx     # Drag-and-drop file upload zone
│   │   │   ├── GraphPanel.jsx   # Interactive Cytoscape.js canvas
│   │   │   ├── ResultsPanel.jsx # Summary metrics panel
│   │   │   └── Sidebar.jsx      # Collapsible sidebar with search & history
│   │   ├── api.js               # Frontend API client and auth token management
│   │   ├── App.jsx              # Root component & view router
│   │   ├── index.css            # Dark futuristic styling system
│   │   └── main.jsx             # React entrypoint
│   ├── Dockerfile               # Multi-stage production Nginx Dockerfile
│   ├── nginx.conf               # Nginx reverse proxy & SPA fallback configuration
│   ├── .dockerignore            # Frontend Docker ignore list
│   ├── package.json             # Frontend dependencies & scripts
│   └── vite.config.js           # Vite configuration
├── docker-compose.yml           # Production Docker Compose stack
├── docker-compose.dev.yml       # Development Docker Compose stack with hot reload
├── .env.example                 # Root environment template for Docker Compose
├── DOCKER.md                    # Dedicated Docker operations guide
├── requirements.txt             # Root Python requirements
└── README.md                    # Main documentation (this file)
```

---

## Troubleshooting & FAQ

### 1. MongoDB Connection Refused (`127.0.0.1` vs `localhost`)
- On Windows and modern systems, `localhost` can resolve to IPv6 `::1`. If MongoDB is only listening on IPv4, connections may fail.
- **Solution**: Always ensure `MONGODB_URL=mongodb://127.0.0.1:27017` is used for native local runs, or `mongodb://mongodb:27017` when running inside Docker.

### 2. Large ZIP File Upload Fails (413 Request Entity Too Large)
- When uploading codebases larger than 1MB through Nginx, Nginx default limits can block the request.
- **Solution**: The included `frontend/nginx.conf` is pre-configured with `client_max_body_size 100M;`.

### 3. Tree-sitter Compilation Errors on Windows
- If installing `tree-sitter` natively on Windows fails with `error: Microsoft Visual C++ 14.0 or greater is required`:
- **Solution**: Use the **Docker deployment** (`docker compose up -d --build`) which compiles all C grammars inside an isolated Linux container, or install the Microsoft C++ Build Tools.

### 4. AI Explanations Say "Gemini API key is not configured"
- **Solution**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/apikey), add it as `GEMINI_API_KEY=your_key` in your `.env` file, and restart the backend.

---

## License

This project is licensed under the MIT License.
