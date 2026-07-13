import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.crud.crud_cart import cart_crud
from app.schemas.cart import CartOut, CartItemCreate, CartItemUpdate, CartItemOut
from app.schemas.response import ApiResponse

router = APIRouter()

@router.get("/", response_model=ApiResponse[CartOut])
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user's cart.
    """
    cart = cart_crud.get_cart_by_user(db, user_id=current_user.id)
    total_price = cart_crud.calculate_total_price(cart)
    
    # We construct a response dict matching CartOut since Cart object doesn't have total_price
    cart_data = {
        "id": cart.id,
        "user_id": cart.user_id,
        "created_at": cart.created_at,
        "updated_at": cart.updated_at,
        "items": cart.items,
        "total_price": total_price
    }
    return ApiResponse(message="Cart retrieved successfully", data=cart_data)

@router.post("/items", response_model=ApiResponse[CartItemOut])
def add_item_to_cart(
    item_in: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Add a product to the cart. If it exists, increments quantity.
    """
    cart = cart_crud.get_cart_by_user(db, user_id=current_user.id)
    new_item = cart_crud.add_item_to_cart(db, cart_id=cart.id, item_in=item_in)
    return ApiResponse(message="Item added to cart", data=new_item)

@router.patch("/items/{item_id}", response_model=ApiResponse[CartItemOut])
def update_item_quantity(
    item_id: uuid.UUID,
    item_in: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update quantity of a cart item.
    """
    cart = cart_crud.get_cart_by_user(db, user_id=current_user.id)
    item = cart_crud.update_item_quantity(db, item_id=item_id, item_in=item_in)
    
    # If quantity became 0, the item is deleted and returns None
    if not item:
        return ApiResponse(message="Item removed from cart (quantity 0)", data=None)
        
    return ApiResponse(message="Item quantity updated", data=item)

@router.delete("/items/{item_id}", response_model=ApiResponse[None])
def remove_item(
    item_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Remove an item from the cart.
    """
    success = cart_crud.remove_item(db, item_id=item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return ApiResponse(message="Item removed from cart", data=None)

@router.delete("/", response_model=ApiResponse[None])
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Remove all items from the cart.
    """
    cart = cart_crud.get_cart_by_user(db, user_id=current_user.id)
    cart_crud.clear_cart(db, cart_id=cart.id)
    return ApiResponse(message="Cart cleared successfully", data=None)
