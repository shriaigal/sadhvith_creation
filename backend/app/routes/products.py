"""Public + manager product endpoints (search, filter, sort, CRUD)."""
import json
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from pydantic import ValidationError
from fastapi.exceptions import RequestValidationError

from app.schemas.product import ProductCreate, ProductUpdate
from app.services import product_service
from app.utils.deps import get_current_manager

router = APIRouter(prefix="/api/products", tags=["products"])


def _parse_json_field(raw: Optional[str], default):
    if raw is None or raw == "":
        return default
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return default


@router.get("")
def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    material: Optional[str] = None,
    availability: Optional[str] = None,
    featured: Optional[bool] = None,
    badge: Optional[str] = None,
    sort: str = "newest",
    limit: int = Query(100, le=200),
    skip: int = 0,
):
    products = product_service.list_products(
        search=search, category=category, material=material,
        availability=availability, featured=featured, badge=badge,
        sort=sort, public_only=True, limit=limit, skip=skip,
    )
    return {"success": True, "count": len(products), "products": products}


@router.get("/manager/all")
def list_products_for_manager(
    search: Optional[str] = None,
    category: Optional[str] = None,
    availability: Optional[str] = None,
    sort: str = "newest",
    limit: int = Query(200, le=500),
    skip: int = 0,
    current_manager: dict = Depends(get_current_manager),
):
    products = product_service.list_products(
        search=search, category=category, availability=availability,
        sort=sort, public_only=False, limit=limit, skip=skip,
    )
    return {"success": True, "count": len(products), "products": products}


@router.get("/{slug}")
def get_product(slug: str):
    product = product_service.get_product_by_slug(slug)
    related = product_service.get_related_products(product)
    return {"success": True, "product": product, "relatedProducts": related}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_product(
    title: str = Form(...),
    shortDescription: str = Form(""),
    description: str = Form(...),
    originalPrice: float = Form(...),
    offerPercentage: float = Form(0),
    category: str = Form(""),
    material: str = Form(""),
    size: str = Form(""),
    finish: str = Form(""),
    availability: str = Form("Available"),
    badge: str = Form(""),
    featured: bool = Form(False),
    tags: str = Form("[]"),
    specifications: str = Form("{}"),
    images: list[UploadFile] = File(default=[]),
    current_manager: dict = Depends(get_current_manager),
):
    try:
        payload = ProductCreate(
            title=title, shortDescription=shortDescription, description=description,
            originalPrice=originalPrice, offerPercentage=offerPercentage,
            category=category, material=material, size=size, finish=finish,
            availability=availability, badge=badge, featured=featured,
            tags=_parse_json_field(tags, []),
            specifications=_parse_json_field(specifications, {}),
        )
    except ValidationError as exc:
        raise RequestValidationError(exc.errors())

    product = await product_service.create_product(payload, images)
    return {"success": True, "message": "Product created.", "product": product}


@router.put("/{product_id}")
async def update_product(
    product_id: str,
    title: Optional[str] = Form(None),
    shortDescription: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    originalPrice: Optional[float] = Form(None),
    offerPercentage: Optional[float] = Form(None),
    category: Optional[str] = Form(None),
    material: Optional[str] = Form(None),
    size: Optional[str] = Form(None),
    finish: Optional[str] = Form(None),
    availability: Optional[str] = Form(None),
    badge: Optional[str] = Form(None),
    featured: Optional[bool] = Form(None),
    tags: Optional[str] = Form(None),
    specifications: Optional[str] = Form(None),
    existingImages: Optional[str] = Form(None),
    images: list[UploadFile] = File(default=[]),
    current_manager: dict = Depends(get_current_manager),
):
    try:
        payload = ProductUpdate(
            title=title, shortDescription=shortDescription, description=description,
            originalPrice=originalPrice, offerPercentage=offerPercentage,
            category=category, material=material, size=size, finish=finish,
            availability=availability, badge=badge, featured=featured,
            tags=_parse_json_field(tags, None),
            specifications=_parse_json_field(specifications, None),
            existingImages=_parse_json_field(existingImages, None),
        )
    except ValidationError as exc:
        raise RequestValidationError(exc.errors())

    product = await product_service.update_product(product_id, payload, images)
    return {"success": True, "message": "Product updated.", "product": product}


@router.delete("/{product_id}")
def delete_product(product_id: str, current_manager: dict = Depends(get_current_manager)):
    product_service.delete_product(product_id)
    return {"success": True, "message": "Product deleted."}
