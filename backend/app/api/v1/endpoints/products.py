import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_admin
from app.crud.crud_product import product as product_crud
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate
from app.schemas.response import ApiResponse, PaginatedApiResponse, paginate

router = APIRouter()

@router.get("/", response_model=PaginatedApiResponse[ProductOut])
def list_products(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1), db: Session = Depends(get_db)):
    """
    Retrieve all active products. Publicly accessible.
    """
    total_items = db.query(product_crud.model).filter(product_crud.model.is_active == True).count()
    products = product_crud.get_multi_active(db, skip=skip, limit=limit)
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

@router.delete("/{product_id}", response_model=ApiResponse[None])
def delete_product(product_id: uuid.UUID, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    """
    Delete a product. Admin only.
    """
    db_product = product_crud.remove(db, id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ApiResponse(message="Product deleted successfully", data=None)
