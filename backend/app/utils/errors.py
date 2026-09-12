"""Consistent JSON error responses across the API."""
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail},
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Collapse pydantic's verbose error list into a single readable message
    # instead of ever exposing internal structure/stack traces.
    first = exc.errors()[0] if exc.errors() else None
    message = "Invalid request data."
    if first:
        loc = ".".join(str(p) for p in first.get("loc", []) if p != "body")
        msg = first.get("msg", "Invalid value")
        message = f"{loc}: {msg}" if loc else msg
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": message},
    )


async def unhandled_exception_handler(request: Request, exc: Exception):
    # Never leak a Python stack trace to the client.
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Something went wrong. Please try again."},
    )
