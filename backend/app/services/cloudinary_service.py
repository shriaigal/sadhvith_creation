"""
Cloudinary image upload handling.

Manager-uploaded product images are never stored as binary data in
MongoDB — only the resulting secure Cloudinary URL (and public_id, so
we can delete it later) is stored.
"""
import logging
import re

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status

from app.config import settings

logger = logging.getLogger("sadhvith.cloudinary")

_configured = False


def _ensure_configured() -> None:
    global _configured
    if _configured:
        return
    if not (settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET):
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Image upload is not configured. Set CLOUDINARY_CLOUD_NAME, "
            "CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env.",
        )
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )
    _configured = True


def validate_image(file: UploadFile, size_bytes: int) -> None:
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Unsupported image type '{file.content_type}'. Allowed: jpg, jpeg, png, webp.",
        )
    max_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
    if size_bytes > max_bytes:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Image '{file.filename}' exceeds the {settings.MAX_IMAGE_SIZE_MB}MB limit.",
        )


def upload_image(file_bytes: bytes, folder: str = "sadhvith-creation/products") -> dict:
    """Uploads one image to Cloudinary and returns {url, publicId}."""
    _ensure_configured()
    try:
        result = cloudinary.uploader.upload(
            file_bytes,
            folder=folder,
            resource_type="image",
        )
        return {"url": result["secure_url"], "publicId": result["public_id"]}
    except Exception as exc:  # cloudinary raises generic Errors
        logger.error("Cloudinary upload failed: %s", exc)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Image upload failed. Please try again.")


def delete_image(public_id: str) -> None:
    _ensure_configured()
    try:
        cloudinary.uploader.destroy(public_id)
    except Exception as exc:
        # Non-fatal: log and continue, we still remove the product/reference.
        logger.warning("Could not delete Cloudinary image '%s': %s", public_id, exc)


def public_id_from_url(url: str) -> str | None:
    """Best-effort extraction of a Cloudinary public_id from a secure URL,
    used as a fallback when publicId wasn't stored (e.g. seeded/legacy data)."""
    match = re.search(r"/upload/(?:v\d+/)?(.+)\.\w+$", url)
    return match.group(1) if match else None
