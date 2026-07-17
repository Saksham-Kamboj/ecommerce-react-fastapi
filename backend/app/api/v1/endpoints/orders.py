import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user, get_current_active_admin
from app.models.user import User
from app.crud.crud_order import order_crud
from app.crud.crud_cart import cart_crud
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate
from app.schemas.response import ApiResponse, PaginatedApiResponse, paginate

router = APIRouter()


# ── User endpoints ─────────────────────────────────────────────────────────────

@router.post("/", response_model=ApiResponse[OrderOut])
def place_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Place a new order from the current cart.
    - Validates stock for all items
    - Snapshots prices at order time
    - Decrements product stock
    - Cart is cleared only after payment is verified
    """
    cart = cart_crud.get_cart_by_user(db, user_id=current_user.id)
    order = order_crud.create_from_cart(
        db, user_id=current_user.id, cart=cart, order_in=order_in
    )
    return ApiResponse(message="Order placed successfully", data=order)


@router.get("/", response_model=PaginatedApiResponse[OrderOut])
def list_my_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get paginated list of current user's orders."""
    total = order_crud.count_by_user(db, user_id=current_user.id)
    orders = order_crud.get_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
    return paginate(items=orders, total_items=total, skip=skip, limit=limit, message="Orders retrieved")


@router.get("/{order_id}", response_model=ApiResponse[OrderOut])
def get_my_order(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get a specific order by ID (must belong to current user)."""
    order = order_crud.get_by_id(db, order_id=order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    return ApiResponse(message="Order retrieved", data=order)


@router.post("/{order_id}/cancel", response_model=ApiResponse[OrderOut])
def cancel_my_order(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Cancel a pending order and restore product stock."""
    order = order_crud.get_by_id(db, order_id=order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    cancelled = order_crud.cancel_order(db, order=order)
    return ApiResponse(message="Order cancelled successfully", data=cancelled)


# ── Admin endpoints ────────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=PaginatedApiResponse[OrderOut])
def list_all_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """Admin: list all orders with optional status filter."""
    total = order_crud.count_all(db, status=status)
    orders = order_crud.get_all(db, skip=skip, limit=limit, status=status)
    return paginate(items=orders, total_items=total, skip=skip, limit=limit, message="All orders retrieved")


@router.get("/admin/{order_id}", response_model=ApiResponse[OrderOut])
def get_admin_order(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """Admin: get a specific order by ID."""
    order = order_crud.get_by_id(db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return ApiResponse(message="Order retrieved", data=order)


@router.patch("/admin/{order_id}/status", response_model=ApiResponse[OrderOut])
def update_order_status(
    order_id: uuid.UUID,
    status_in: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """Admin: update order status (confirm → ship → deliver)."""
    order = order_crud.get_by_id(db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    updated = order_crud.update_status(db, order=order, new_status=status_in.status)
    return ApiResponse(message=f"Order status updated to {status_in.status}", data=updated)
