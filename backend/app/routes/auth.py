"""Manager authentication endpoints."""
from fastapi import APIRouter, Depends, status

from app.schemas.manager import ManagerRegister, ManagerLogin, TokenResponse
from app.services import auth_service
from app.utils.deps import get_current_manager

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: ManagerRegister):
    return auth_service.register_manager(payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: ManagerLogin):
    return auth_service.login_manager(payload)


@router.get("/me")
def me(current_manager: dict = Depends(get_current_manager)):
    return {"success": True, "manager": current_manager}


@router.post("/logout")
def logout():
    # JWTs are stateless; logout is a frontend concern (discard the token).
    # This endpoint exists so the frontend has a symmetric call to make,
    # and so a future token-blacklist could be added without an API change.
    return {"success": True, "message": "Logged out."}
