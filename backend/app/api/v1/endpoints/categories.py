import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.api.deps import get_db, get_current_active_admin
from app.crud.crud_category import category as category_crud
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate
from app.schemas.response import ApiResponse, PaginatedApiResponse, paginate

router = APIRouter()

@router.get("/", response_model=PaginatedApiResponse[CategoryOut])
def list_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    search: str | None = Query(None),
    db: Session = Depends(get_db)
):
    """
    Retrieve all categories. Publicly accessible.
    """
    total_items = category_crud.count(db, search=search)
    categories = category_crud.get_multi(db, skip=skip, limit=limit, search=search)
    return paginate(
        items=categories,
        total_items=total_items,
        skip=skip,
        limit=limit,
        message="Categories retrieved successfully"
    )

@router.get("/{category_id}", response_model=ApiResponse[CategoryOut])
def get_category(category_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Get a specific category by ID. Publicly accessible.
    """
    db_category = category_crud.get(db, id=category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return ApiResponse(message="Category retrieved successfully", data=db_category)

@router.post("/", response_model=ApiResponse[CategoryOut])
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    """
    Create a new category. Admin only.
    """
    if category_crud.get_by_slug(db, slug=category_in.slug):
        raise HTTPException(status_code=400, detail="Category with this slug already exists")
    
    try:
        new_category = category_crud.create(db, obj_in=category_in)
        return ApiResponse(message="Category created successfully", data=new_category)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Category creation failed due to database constraint")

@router.patch("/{category_id}", response_model=ApiResponse[CategoryOut])
def update_category(category_id: uuid.UUID, category_in: CategoryUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    """
    Update an existing category. Admin only.
    """
    db_category = category_crud.get(db, id=category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    if category_in.slug and category_in.slug != db_category.slug:
        if category_crud.get_by_slug(db, slug=category_in.slug):
            raise HTTPException(status_code=400, detail="Category with this slug already exists")
            
    try:
        updated_category = category_crud.update(db, db_obj=db_category, obj_in=category_in)
        return ApiResponse(message="Category updated successfully", data=updated_category)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Category update failed due to database constraint")

@router.delete("/{category_id}", response_model=ApiResponse[None])
def delete_category(category_id: uuid.UUID, db: Session = Depends(get_db), current_user = Depends(get_current_active_admin)):
    """
    Delete a category. Admin only.
    """
    try:
        db_category = category_crud.remove(db, id=category_id)
        if not db_category:
            raise HTTPException(status_code=404, detail="Category not found")
        return ApiResponse(message="Category deleted successfully", data=None)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete category due to existing references.")
