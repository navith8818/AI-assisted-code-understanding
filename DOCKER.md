# Docker Setup Guide for FlowGen

FlowGen is completely containerized with Docker and Docker Compose, providing a multi-container stack for the **FastAPI Backend**, **React Frontend**, and **MongoDB Database**.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │             Host Machine               │
                      └──────────────────┬─────────────────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 │                       │                       │
           Port 5173 / 3000          Port 8000              Port 27017
                 │                       │                       │
                 ▼                       ▼                       ▼
    ┌────────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │    flowgen-frontend    │  │ flowgen-backend  │  │ flowgen-mongodb  │
    │     (Nginx + SPA)      ├──►│ (FastAPI + Py)   ├──►│  (Mongo 7.0 DB)  │
    └────────────────────────┘  └──────────────────┘  └──────────────────┘
                 │                       │                       │
                 └───────────────────────┴───────────────────────┘
                                 flowgen-network (Bridge)
```

---

## Prerequisites

1. Ensure **Docker** and **Docker Compose** are installed.
2. (Windows/macOS) Start the **Docker Desktop** application.

---

## Quick Start (Production Mode)

### 1. (Optional) Configure Environment Variables
Copy the example `.env` file and optionally insert your Gemini API key:
```bash
cp .env.example .env
```

### 2. Build and Run the Entire Stack
Run this command in the project root:
```bash
docker compose up -d --build
```

### 3. Access the Services
- **FlowGen Frontend**: [http://localhost:5173](http://localhost:5173) or [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **MongoDB**: `mongodb://localhost:27017`

---

## Development Mode (With Live Reloading)

For local development where changes in `backend/` or `frontend/` instantly reflect in the running containers without rebuilding:

```bash
docker compose -f docker-compose.dev.yml up --build
```

---

## Useful Docker Commands

### View Container Logs
```bash
# Follow logs for all services
docker compose logs -f

# Follow logs for backend only
docker compose logs -f backend

# Follow logs for frontend only
docker compose logs -f frontend

# Follow logs for database only
docker compose logs -f mongodb
```

### Stop the Containers
```bash
docker compose down
```

### Stop and Wipe Persistent Data Volumes
```bash
docker compose down -v
```

### Restart a Specific Service
```bash
docker compose restart backend
```

---

## Container Details

| Service | Base Image | Internal Port | Host Port | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`frontend`** | `node:20-alpine` ➔ `nginx:alpine` | `80` | `5173`, `3000` | Multi-stage build serving React SPA and reverse proxying API requests |
| **`backend`** | `python:3.10-slim` | `8000` | `8000` | FastAPI server with tree-sitter parsers, NetworkX, Motor, and JWT auth |
| **`mongodb`** | `mongo:7.0` | `27017` | `27017` | Persistent document database for user accounts and code analysis history |
