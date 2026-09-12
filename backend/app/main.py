"""SADHVITH CREATION — FastAPI application entrypoint."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, products, manager
from app.utils.errors import (
    http_exception_handler,
    validation_exception_handler,
    unhandled_exception_handler,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sadhvith.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_to_mongo()
    yield
    close_mongo_connection()


app = FastAPI(
    title="Sadhvith Creation API",
    description="Backend API for the Sadhvith Creation product catalogue and manager dashboard.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the configured frontend origin (plus localhost dev ports).
allowed_origins = {settings.FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"}
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(manager.router)


@app.get("/")
def root():
    return {"success": True, "message": "Sadhvith Creation API is running.", "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"success": True, "status": "ok"}
