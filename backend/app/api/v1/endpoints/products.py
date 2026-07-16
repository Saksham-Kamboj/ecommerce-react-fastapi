import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_admin
from app.crud.crud_product import product as product_crud
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate
from app.schemas.response import ApiResponse, PaginatedApiResponse, paginate

router = APIRouter()

UPLOAD_DIR = Path("uploads/products")
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def _validate_image(file: UploadFile) -> str:
    extension = ALLOWED_IMAGE_TYPES.get(file.content_type or "")
    if not extension:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WebP images are allowed")
    return extension


async def _save_product_image(file: UploadFile, product_id: uuid.UUID) -> str:
    extension = _validate_image(file)
    content = await file.read()
    if len(content) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image must be 2MB or smaller")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{product_id}-{uuid.uuid4().hex}{extension}"
    image_path = UPLOAD_DIR / filename
    image_path.write_bytes(content)
    return f"/uploads/products/{filename}"

@router.get("/", response_model=PaginatedApiResponse[ProductOut])
def list_products(
    skip: int = Query(0, ge=0), 
    limit: int = Query(10, ge=1), 
    search: str | None = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db)
):
    """
    Retrieve all active products. Publicly accessible.
    """
    total_items = product_crud.count_active(db, search=search)
    products = product_crud.get_multi_active(db, skip=skip, limit=limit, search=search, sort_by=sort_by, sort_order=sort_order)
    return paginate(
        items=products,
        total_items=total_items,
        skip=skip,
        limit=limit,
        message="Products retrieved successfully"
    )

@router.get("/{product_id}", response_model=ApiResponse[ProductOut])
def get_product(product_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Get a specific product by ID. Publicly accessible.
    """
    db_product = product_crud.get(db, id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ApiResponse(message="Product retrieved successfully", data=db_product)

@router.post("/", response_model=ApiResponse[ProductOut])
def create_product(product_in: ProductCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    """
    Create a new product. Admin only.
    """
    new_product = product_crud.create(db, obj_in=product_in)
    return ApiResponse(message="Product created successfully", data=new_product)

@router.patch("/{product_id}", response_model=ApiResponse[ProductOut])
def update_product(product_id: uuid.UUID, product_in: ProductUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    """
    Update an existing product. Admin only.
    """
    db_product = product_crud.get(db, id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    updated_product = product_crud.update(db, db_obj=db_product, obj_in=product_in)
    return ApiResponse(message="Product updated successfully", data=updated_product)

@router.post("/{product_id}/upload-image", response_model=ApiResponse[ProductOut])
async def upload_product_image(
    product_id: uuid.UUID,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin),
):
    """
    Upload or replace a product image. Superadmin only.
    """
    db_product = product_crud.get(db, id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    image_url = await _save_product_image(image, product_id)
    db_product.image_url = image_url
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return ApiResponse(message="Product image uploaded successfully", data=db_product)

@router.delete("/{product_id}", response_model=ApiResponse[None])
def delete_product(product_id: uuid.UUID, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    """
    Delete a product. Admin only.
    """
    from sqlalchemy.exc import IntegrityError
    from app.models.order import OrderItem, OrderStatus

    db_product = product_crud.get(db, id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if product is in any orders
    order_items = db.query(OrderItem).filter(OrderItem.product_id == product_id).all()
    has_active_orders = any(item.order.status != OrderStatus.cancelled for item in order_items)
    
    if has_active_orders:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete this product because it is part of one or more active orders. Please deactivate it instead."
        )

    # If only in cancelled orders, remove from those orders to allow hard delete
    for item in order_items:
        order = item.order
        order.total_amount -= (item.unit_price * item.quantity)
        db.delete(item)
        if order.total_amount <= 0:
            db.delete(order)
    db.commit()

    try:
        product_crud.remove(db, id=product_id)
        return ApiResponse(message="Product deleted successfully", data=None)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete product due to existing references.")
