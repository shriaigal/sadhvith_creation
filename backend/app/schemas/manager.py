"""Pydantic schemas for manager registration, login, and profile data."""
from pydantic import BaseModel, EmailStr, Field, field_validator


class ManagerRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    confirmPassword: str

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name is required.")
        return v.strip()

    @field_validator("confirmPassword")
    @classmethod
    def passwords_match(cls, v: str, info):
        password = info.data.get("password")
        if password is not None and v != password:
            raise ValueError("Passwords do not match.")
        return v


class ManagerLogin(BaseModel):
    email: EmailStr
    password: str


class ManagerOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    createdAt: str


class TokenResponse(BaseModel):
    success: bool = True
    token: str
    tokenType: str = "bearer"
    manager: ManagerOut
