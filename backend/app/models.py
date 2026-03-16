from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime

# ── What the frontend sends to REGISTER ──
from pydantic import BaseModel, field_validator

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

    @field_validator("password")
    @classmethod
    def password_length(cls, v):
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 characters or fewer")
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

# ── What the frontend sends to LOGIN ──
class UserLogin(BaseModel):
    username: str
    password: str

# ── What we send BACK after login (the token) ──
class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ── What we send back when returning a user ──
class UserOut(BaseModel):
    id: str
    username: str
    email: str

# ── What we send back for a project ──
class ProjectOut(BaseModel):
    id: str
    name: str
    user_id: str
    created_at: datetime

# ── What we send back for an analysis ──
class AnalysisOut(BaseModel):
    id: str
    project_id: str
    call_graph: Any     # the graph JSON
    dep_graph: Any
    created_at: datetime

# ── What the frontend sends to CREATE an annotation ──
class AnnotationCreate(BaseModel):
    node_id: str        # e.g. "MyClass.my_method"
    note: str = ""
    color: str = "#FFD700"

# ── What we send back for an annotation ──
class AnnotationOut(AnnotationCreate):
    id: str
    analysis_id: str
    created_at: datetime