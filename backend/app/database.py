"""
MongoDB Atlas connection handling.

Uses PyMongo synchronously (FastAPI runs blocking I/O calls like this
in a threadpool automatically, so this is safe and simple for a
project of this size — no local MongoDB dependency, ever).
"""
import logging
import sys

from pymongo import MongoClient, ASCENDING
from pymongo.errors import ConnectionFailure, ConfigurationError

from app.config import settings

logger = logging.getLogger("sadhvith.database")

client: MongoClient | None = None
db = None


def connect_to_mongo() -> None:
    """Connect to MongoDB Atlas and verify the connection. Called on app startup."""
    global client, db

    if not settings.MONGODB_URI:
        logger.error(
            "MONGODB_URI is not set. Copy backend/.env.example to backend/.env "
            "and fill in your MongoDB Atlas connection string."
        )
        raise RuntimeError("MONGODB_URI environment variable is missing.")

    try:
        client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=8000)
        # The ping command verifies that the Atlas cluster is reachable and
        # that the credentials in the connection string are valid.
        client.admin.command("ping")
        db = client[settings.MONGODB_DB_NAME]
        logger.info("Connected to MongoDB Atlas database '%s'.", settings.MONGODB_DB_NAME)
        _ensure_indexes()
    except (ConnectionFailure, ConfigurationError) as exc:
        logger.error("Could not connect to MongoDB Atlas: %s", exc)
        raise RuntimeError(
            "Failed to connect to MongoDB Atlas. Check MONGODB_URI, your "
            "Atlas network access list, and your database user credentials."
        ) from exc


def close_mongo_connection() -> None:
    global client
    if client is not None:
        client.close()
        logger.info("MongoDB Atlas connection closed.")


def _ensure_indexes() -> None:
    """Create indexes used by search, filtering, and uniqueness constraints."""
    if db is None:
        return

    db.products.create_index([("slug", ASCENDING)], unique=True)
    db.products.create_index([("title", ASCENDING)])
    db.products.create_index([("category", ASCENDING)])
    db.products.create_index([("tags", ASCENDING)])
    db.products.create_index(
        [("title", "text"), ("description", "text"), ("shortDescription", "text"),
         ("category", "text"), ("material", "text"), ("tags", "text")],
        name="product_search_index",
    )
    db.managers.create_index([("email", ASCENDING)], unique=True)
    logger.info("MongoDB indexes verified.")


def get_db():
    """Dependency-style accessor used by services/routes."""
    if db is None:
        raise RuntimeError("Database is not connected yet.")
    return db
