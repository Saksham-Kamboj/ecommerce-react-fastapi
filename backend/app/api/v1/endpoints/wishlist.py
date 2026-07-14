import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.crud.crud_wishlist import wishlist_crud
from app.schemas.wishlist import WishlistItemOut
from app.schemas.response import ApiResponse

router = APIRouter()


@router.get("/", response_model=ApiResponse[list[WishlistItemOut]])
def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get all wishlist items for the current user."""
    items = wishlist_crud.get_by_user(db, user_id=current_user.id)
    return ApiResponse(message="Wishlist retrieved successfully", data=items)


@router.post("/{product_id}", response_model=ApiResponse[WishlistItemOut])
def add_to_wishlist(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Add a product to the current user's wishlist."""
    item = wishlist_crud.add(db, user_id=current_user.id, product_id=product_id)
    return ApiResponse(message="Added to wishlist", data=item)


@router.delete("/{product_id}", response_model=ApiResponse[None])
def remove_from_wishlist(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Remove a product from the current user's wishlist."""
    removed = wishlist_crud.remove(db, user_id=current_user.id, product_id=product_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Item not in wishlist")
    return ApiResponse(message="Removed from wishlist", data=None)
