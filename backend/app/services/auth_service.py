"""Business logic for manager registration and login."""
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status

from app.database import get_db
from app.schemas.manager import ManagerRegister, ManagerLogin
from app.utils.security import hash_password, verify_password, create_access_token


def _serialize_manager(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "createdAt": doc["createdAt"].isoformat() if isinstance(doc.get("createdAt"), datetime) else doc.get("createdAt", ""),
    }


def register_manager(payload: ManagerRegister) -> dict:
    db = get_db()

    existing = db.managers.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists.")

    now = datetime.now(timezone.utc)
    manager_doc = {
        "name": payload.name,
        "email": payload.email.lower(),
        "passwordHash": hash_password(payload.password),
        "createdAt": now,
        "updatedAt": now,
    }
    result = db.managers.insert_one(manager_doc)
    manager_doc["_id"] = result.inserted_id

    token = create_access_token({"sub": str(manager_doc["_id"]), "email": manager_doc["email"]})
    return {"success": True, "token": token, "tokenType": "bearer", "manager": _serialize_manager(manager_doc)}


def login_manager(payload: ManagerLogin) -> dict:
    db = get_db()

    manager_doc = db.managers.find_one({"email": payload.email.lower()})
    if not manager_doc or not verify_password(payload.password, manager_doc["passwordHash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")

    token = create_access_token({"sub": str(manager_doc["_id"]), "email": manager_doc["email"]})
    return {"success": True, "token": token, "tokenType": "bearer", "manager": _serialize_manager(manager_doc)}


def get_manager_by_id(manager_id: str) -> dict:
    db = get_db()
    try:
        oid = ObjectId(manager_id)
    except Exception:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid authentication token.")

    manager_doc = db.managers.find_one({"_id": oid})
    if not manager_doc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Manager account no longer exists.")
    return _serialize_manager(manager_doc)
