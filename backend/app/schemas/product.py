"""Pydantic schemas for product create/update/read payloads."""
from typing import Optional
from pydantic import BaseModel, Field, field_validator

ALLOWED_AVAILABILITY = {"Available", "Made to Order", "Out of Stock", "Inactive"}


class ProductBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    shortDescription: Optional[str] = ""
    description: str = Field(..., min_length=5)

    originalPrice: float = Field(..., gt=0)
    offerPercentage: float = Field(0, ge=0, le=100)

    category: Optional[str] = ""
    material: Optional[str] = ""
    size: Optional[str] = ""
    finish: Optional[str] = ""

    availability: str = "Available"
    badge: Optional[str] = ""
    featured: bool = False

    tags: list[str] = []
    specifications: dict[str, str] = {}

    @field_validator("availability")
    @classmethod
    def validate_availability(cls, v: str) -> str:
        if v not in ALLOWED_AVAILABILITY:
            raise ValueError(f"availability must be one of {sorted(ALLOWED_AVAILABILITY)}")
        return v

    @field_validator("tags", mode="before")
    @classmethod
    def split_tags(cls, v):
        if isinstance(v, str):
            return [t.strip() for t in v.split(",") if t.strip()]
        return v or []


class ProductCreate(ProductBase):
    """Used for POST /api/products. Images are handled separately as multipart files."""
    pass


class ProductUpdate(BaseModel):
    """All fields optional — only provided fields are updated."""
    title: Optional[str] = None
    shortDescription: Optional[str] = None
    description: Optional[str] = None
    originalPrice: Optional[float] = Field(None, gt=0)
    offerPercentage: Optional[float] = Field(None, ge=0, le=100)
    category: Optional[str] = None
    material: Optional[str] = None
    size: Optional[str] = None
    finish: Optional[str] = None
    availability: Optional[str] = None
    badge: Optional[str] = None
    featured: Optional[bool] = None
    tags: Optional[list[str]] = None
    specifications: Optional[dict[str, str]] = None
    existingImages: Optional[list[str]] = None  # image URLs kept from before, in order

    @field_validator("availability")
    @classmethod
    def validate_availability(cls, v):
        if v is not None and v not in ALLOWED_AVAILABILITY:
            raise ValueError(f"availability must be one of {sorted(ALLOWED_AVAILABILITY)}")
        return v

    @field_validator("tags", mode="before")
    @classmethod
    def split_tags(cls, v):
        if isinstance(v, str):
            return [t.strip() for t in v.split(",") if t.strip()]
        return v
