from fastapi import APIRouter, HTTPException, Depends
from app.models import UserRegister, UserLogin, TokenOut, UserOut
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app import crud

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserOut)
async def register(body: UserRegister):
    if await crud.get_user_by_username(body.username):
        raise HTTPException(status_code=400, detail="Username already taken")

    # Validate password length before hashing
    if len(body.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password too long — must be 72 characters or fewer"
        )

    user = await crud.create_user(
        username=body.username,
        email=body.email,
        hashed_password=hash_password(body.password),
    )
    return user


@router.post("/login", response_model=TokenOut)
async def login(body: UserLogin):
    user = await crud.get_user_by_username(body.username)

    # Wrong username OR wrong password → same error (don't leak which one)
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    # sub = "subject" — standard JWT field, we store user ID here
    token = create_access_token({"sub": str(user["_id"])})
    return {"access_token": token}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return {
        "id": str(current_user["_id"]),
        "username": current_user["username"],
        "email": current_user["email"]
    }

