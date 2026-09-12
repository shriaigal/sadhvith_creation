"""Business logic for product CRUD, pricing, search, filtering and sorting."""
import re
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, UploadFile, status

from app.config import settings
from app.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate
from app.services import cloudinary_service


def slugify(text: str) -> str:
    slug = text.strip().lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def _unique_slug(db, base_slug: str, exclude_id: str | None = None) -> str:
    slug = base_slug or "product"
    counter = 1
    query = {"slug": slug}
    if exclude_id:
        query["_id"] = {"$ne": ObjectId(exclude_id)}
    while db.products.find_one(query):
        counter += 1
        slug = f"{base_slug}-{counter}"
        query["slug"] = slug
    return slug


def calculate_pricing(original_price: float, offer_percentage: float) -> dict:
    """The backend is the single source of truth for pricing math.
    A frontend-supplied finalPrice/discountAmount is NEVER trusted."""
    if original_price <= 0:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "originalPrice must be greater than 0.")
    if offer_percentage < 0 or offer_percentage > 100:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "offerPercentage must be between 0 and 100.")

    if offer_percentage == 0:
        discount_amount = 0.0
        final_price = round(original_price, 2)
    else:
        discount_amount = round(original_price * offer_percentage / 100, 2)
        final_price = round(original_price - discount_amount, 2)

    return {
        "originalPrice": round(original_price, 2),
        "offerPercentage": offer_percentage,
        "discountAmount": discount_amount,
        "finalPrice": final_price,
    }


def _serialize(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    for field in ("createdAt", "updatedAt"):
        if isinstance(doc.get(field), datetime):
            doc[field] = doc[field].isoformat()
    # Public API only needs the URL, not Cloudinary internals.
    doc["images"] = [img["url"] if isinstance(img, dict) else img for img in doc.get("images", [])]
    return doc


async def _process_uploaded_images(files: list[UploadFile]) -> list[dict]:
    images = []
    for f in files:
        content = await f.read()
        cloudinary_service.validate_image(f, len(content))
        uploaded = cloudinary_service.upload_image(content)
        images.append(uploaded)
    return images


async def create_product(payload: ProductCreate, files: list[UploadFile]) -> dict:
    db = get_db()

    files = [f for f in files if f and f.filename]
    if len(files) > settings.MAX_IMAGES_PER_PRODUCT:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"A product can have at most {settings.MAX_IMAGES_PER_PRODUCT} images "
            f"({len(files)} were provided).",
        )

    pricing = calculate_pricing(payload.originalPrice, payload.offerPercentage)
    images = await _process_uploaded_images(files)

    now = datetime.now(timezone.utc)
    slug = _unique_slug(db, slugify(payload.title))

    doc = {
        "title": payload.title,
        "slug": slug,
        "shortDescription": payload.shortDescription or "",
        "description": payload.description,
        **pricing,
        "category": payload.category or "",
        "material": payload.material or "",
        "size": payload.size or "",
        "finish": payload.finish or "",
        "availability": payload.availability,
        "badge": payload.badge or "",
        "featured": payload.featured,
        "tags": payload.tags,
        "specifications": payload.specifications,
        "images": images,
        "createdAt": now,
        "updatedAt": now,
    }
    result = db.products.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def _get_product_doc_or_404(db, product_id: str) -> dict:
    try:
        oid = ObjectId(product_id)
    except InvalidId:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.")
    doc = db.products.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.")
    return doc


async def update_product(product_id: str, payload: ProductUpdate, files: list[UploadFile]) -> dict:
    db = get_db()
    doc = _get_product_doc_or_404(db, product_id)

    files = [f for f in files if f and f.filename]

    # Images the manager kept from before (order preserved), plus new uploads.
    existing_images_by_url = {img["url"]: img for img in doc.get("images", []) if isinstance(img, dict)}
    kept_urls = payload.existingImages if payload.existingImages is not None else list(existing_images_by_url.keys())
    kept_images = [existing_images_by_url[u] for u in kept_urls if u in existing_images_by_url]

    total_after_update = len(kept_images) + len(files)
    if total_after_update > settings.MAX_IMAGES_PER_PRODUCT:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"A product can have at most {settings.MAX_IMAGES_PER_PRODUCT} images "
            f"({total_after_update} were provided).",
        )
    if total_after_update == 0:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "A product needs at least 1 image.")

    # Delete Cloudinary images that were removed by the manager.
    removed_images = [img for url, img in existing_images_by_url.items() if url not in kept_urls]
    for img in removed_images:
        public_id = img.get("publicId") or cloudinary_service.public_id_from_url(img["url"])
        if public_id:
            cloudinary_service.delete_image(public_id)

    new_images = await _process_uploaded_images(files)
    final_images = kept_images + new_images

    update_fields: dict = {}
    data = payload.model_dump(exclude_unset=True, exclude={"existingImages"})

    if "title" in data:
        update_fields["title"] = data["title"]
        update_fields["slug"] = _unique_slug(db, slugify(data["title"]), exclude_id=product_id)
    for key in ("shortDescription", "description", "category", "material", "size",
                "finish", "availability", "badge", "featured", "tags", "specifications"):
        if key in data:
            update_fields[key] = data[key]

    original_price = data.get("originalPrice", doc["originalPrice"])
    offer_percentage = data.get("offerPercentage", doc["offerPercentage"])
    if "originalPrice" in data or "offerPercentage" in data:
        update_fields.update(calculate_pricing(original_price, offer_percentage))

    update_fields["images"] = final_images
    update_fields["updatedAt"] = datetime.now(timezone.utc)

    db.products.update_one({"_id": doc["_id"]}, {"$set": update_fields})
    updated = db.products.find_one({"_id": doc["_id"]})
    return _serialize(updated)


def delete_product(product_id: str) -> None:
    db = get_db()
    doc = _get_product_doc_or_404(db, product_id)

    for img in doc.get("images", []):
        if isinstance(img, dict):
            public_id = img.get("publicId") or cloudinary_service.public_id_from_url(img["url"])
            if public_id:
                cloudinary_service.delete_image(public_id)

    db.products.delete_one({"_id": doc["_id"]})


def get_product_by_slug(slug: str, public_only: bool = True) -> dict:
    db = get_db()
    doc = db.products.find_one({"slug": slug})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.")
    if public_only and doc.get("availability") == "Inactive":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.")
    return _serialize(doc)


def get_product_by_id(product_id: str) -> dict:
    db = get_db()
    doc = _get_product_doc_or_404(db, product_id)
    return _serialize(doc)


SORT_MAP = {
    "newest": [("createdAt", -1)],
    "price-asc": [("finalPrice", 1)],
    "price-desc": [("finalPrice", -1)],
    "rating": [("rating", -1), ("createdAt", -1)],
    "featured": [("featured", -1), ("createdAt", -1)],
}


def list_products(
    search: str | None = None,
    category: str | None = None,
    material: str | None = None,
    availability: str | None = None,
    featured: bool | None = None,
    badge: str | None = None,
    sort: str = "newest",
    public_only: bool = True,
    limit: int = 100,
    skip: int = 0,
) -> list[dict]:
    db = get_db()
    query: dict = {}

    if public_only:
        query["availability"] = {"$ne": "Inactive"}
    if category and category != "All":
        query["category"] = category
    if material:
        query["material"] = material
    if availability:
        query["availability"] = availability
    if featured is not None:
        query["featured"] = featured
    if badge:
        query["badge"] = badge
    if search:
        query["$text"] = {"$search": search}

    cursor = db.products.find(query).sort(SORT_MAP.get(sort, SORT_MAP["newest"])).skip(skip).limit(limit)
    return [_serialize(doc) for doc in cursor]


def get_related_products(product: dict, limit: int = 4) -> list[dict]:
    db = get_db()
    query = {
        "category": product.get("category"),
        "_id": {"$ne": ObjectId(product["id"])},
        "availability": {"$ne": "Inactive"},
    }
    cursor = db.products.find(query).limit(limit)
    return [_serialize(doc) for doc in cursor]


def get_dashboard_stats() -> dict:
    db = get_db()
    total = db.products.count_documents({})
    active = db.products.count_documents({"availability": {"$in": ["Available", "Made to Order"]}})
    out_of_stock = db.products.count_documents({"availability": "Out of Stock"})
    featured = db.products.count_documents({"featured": True})
    return {
        "totalProducts": total,
        "activeProducts": active,
        "outOfStock": out_of_stock,
        "featuredProducts": featured,
    }
