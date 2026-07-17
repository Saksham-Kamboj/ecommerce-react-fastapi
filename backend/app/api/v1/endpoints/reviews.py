import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.crud.crud_review import review as review_crud
from app.crud.crud_product import product as product_crud
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewOut, ReviewUpdate
from app.schemas.response import ApiResponse, PaginatedApiResponse, paginate

router = APIRouter()

@router.get("/products/{product_id}/reviews", response_model=PaginatedApiResponse[ReviewOut])
def get_product_reviews(
    product_id: uuid.UUID,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get reviews for a product.
    """
    product = product_crud.get(db, id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    reviews, total = review_crud.get_by_product(db, product_id=product_id, skip=skip, limit=limit)
    return paginate(reviews, total, skip, limit)

@router.post("/products/{product_id}/reviews", response_model=ApiResponse[ReviewOut])
def create_product_review(
    product_id: uuid.UUID,
    *,
    db: Session = Depends(get_db),
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create a review for a product.
    """
    product = product_crud.get(db, id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing_review = review_crud.get_by_user_and_product(db, user_id=current_user.id, product_id=product_id)
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")

    review = review_crud.create_with_user(
        db=db, obj_in=review_in, user_id=current_user.id, product_id=product_id
    )
    return ApiResponse(message="Review created successfully", data=review)

@router.put("/reviews/{review_id}", response_model=ApiResponse[ReviewOut])
def update_review(
    review_id: uuid.UUID,
    *,
    db: Session = Depends(get_db),
    review_in: ReviewUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update a review.
    """
    review = review_crud.get(db, id=review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if review.user_id != current_user.id and current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    review = review_crud.update(db=db, db_obj=review, obj_in=review_in)
    return ApiResponse(message="Review updated successfully", data=review)

@router.delete("/reviews/{review_id}", response_model=ApiResponse[None])
def delete_review(
    review_id: uuid.UUID,
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete a review.
    """
    review = review_crud.get(db, id=review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    if review.user_id != current_user.id and current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    review_crud.remove(db=db, id=review_id)
    return ApiResponse(message="Review deleted successfully", data=None)
