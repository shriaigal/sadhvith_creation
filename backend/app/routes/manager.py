"""Manager-only endpoints that aren't specifically about a single product
(dashboard summary, profile). Product CRUD itself lives in routes/products.py."""
from fastapi import APIRouter, Depends

from app.services import product_service
from app.utils.deps import get_current_manager

router = APIRouter(prefix="/api/manager", tags=["manager"])


@router.get("/dashboard")
def dashboard(current_manager: dict = Depends(get_current_manager)):
    return {
        "success": True,
        "manager": current_manager,
        "stats": product_service.get_dashboard_stats(),
    }
