import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
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

    import cloudinary.uploader
    
    # Upload to Cloudinary using the file bytes
    try:
        result = cloudinary.uploader.upload(
            content,
            folder="ecommerce/products",
            public_id=f"{product_id}-{uuid.uuid4().hex}",
            resource_type="image"
        )
        return result.get("secure_url")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

@router.get("/", response_model=PaginatedApiResponse[ProductOut])
def list_products(
    skip: int = Query(0, ge=0), 
    limit: int = Query(10, ge=1), 
    search: str | None = Query(None),
    category_id: uuid.UUID | None = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db)
):
    """
    Retrieve all active products. Publicly accessible.
    """
    total_items = product_crud.count_active(db, search=search, category_id=category_id)
    products = product_crud.get_multi_active(db, skip=skip, limit=limit, search=search, category_id=category_id, sort_by=sort_by, sort_order=sort_order)
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
async def create_product(
    name: str = Form(..., min_length=1, max_length=255),
    price: float = Form(..., ge=0.0),
    description: str | None = Form(None),
    stock_quantity: int = Form(0, ge=0),
    category_id: uuid.UUID | None = Form(None),
    is_active: bool = Form(True),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_active_admin)
):
    """
    Create a new product. Admin only.
    """
    product_in = ProductCreate(
        name=name,
        description=description,
        price=price,
        stock_quantity=stock_quantity,
        category_id=category_id,
        is_active=is_active
    )
    new_product = product_crud.create(db, obj_in=product_in)
    
    if image:
        image_url = await _save_product_image(image, new_product.id)
        new_product.image_url = image_url
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        
    return ApiResponse(message="Product created successfully", data=new_product)

@router.patch("/{product_id}", response_model=ApiResponse[ProductOut])
async def update_product(
    product_id: uuid.UUID,
    name: str | None = Form(None, min_length=1, max_length=255),
    price: float | None = Form(None, ge=0.0),
    description: str | None = Form(None),
    stock_quantity: int | None = Form(None, ge=0),
    category_id: uuid.UUID | None = Form(None),
    is_active: bool | None = Form(None),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_active_admin)
):
    """
    Update an existing product. Admin only.
    """
    db_product = product_crud.get(db, id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    form_data = {
        "name": name,
        "price": price,
        "description": None if description == "null" else description,
        "stock_quantity": stock_quantity,
        "category_id": None if category_id == "null" else category_id,
        "is_active": is_active,
    }
    
    # Filter out fields that weren't provided in the form
    update_data = {k: v for k, v in form_data.items() if v is not None}
    product_in = ProductUpdate(**update_data)
    updated_product = product_crud.update(db, db_obj=db_product, obj_in=product_in)
    
    if image:
        image_url = await _save_product_image(image, updated_product.id)
        updated_product.image_url = image_url
        db.add(updated_product)
        db.commit()
        db.refresh(updated_product)
        
    return ApiResponse(message="Product updated successfully", data=updated_product)

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
