import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user, get_current_active_admin
from app.models.user import User
from app.crud.crud_order import order_crud
from app.crud.crud_cart import cart_crud
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate
from app.schemas.response import ApiResponse, PaginatedApiResponse, paginate
from app.utils.email import send_order_placed_email, send_order_cancellation_email, send_order_status_update_email
from app.crud.crud_notification import notification_crud
from app.schemas.notification import NotificationCreate

router = APIRouter()


# ── User endpoints ─────────────────────────────────────────────────────────────

@router.post("/", response_model=ApiResponse)
def place_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Validate cart and stock (pre-payment check).
    Order NOT created here - created after payment verification.
    """
    cart = cart_crud.get_cart_by_user(db, user_id=current_user.id)
    if not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Validate stock for all items
    for cart_item in cart.items:
        if cart_item.product.stock_quantity < cart_item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for '{cart_item.product.name}'. Available: {cart_item.product.stock_quantity}",
            )

    return ApiResponse(message="Cart validated. Proceed to payment.")


@router.get("/", response_model=PaginatedApiResponse[OrderOut])
def list_my_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get paginated list of current user's orders."""
    total = order_crud.count_by_user(db, user_id=current_user.id, search=search)
    orders = order_crud.get_by_user(db, user_id=current_user.id, skip=skip, limit=limit, search=search)
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
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Cancel a pending order and restore product stock."""
    order = order_crud.get_by_id(db, order_id=order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    cancelled_order = order_crud.cancel_order(db, order=order)
    
    background_tasks.add_task(
        send_order_cancellation_email,
        email_to=current_user.email,
        order_id=str(cancelled_order.id),
        total_amount=cancelled_order.total_amount,
        user_name=current_user.full_name or current_user.email.split("@")[0],
        items=[{
            "name": item.product.name,
            "image_url": item.product.image_url,
            "quantity": item.quantity,
            "price": float(item.unit_price)
        } for item in cancelled_order.items]
    )
    
    # Create notification
    notification_crud.create(
        db,
        obj_in=NotificationCreate(
            title="Order Cancelled",
            message=f"Order #{str(cancelled_order.id)[:8]} was cancelled by {current_user.email}",
            type="order_cancelled"
        )
    )

    return ApiResponse(message="Order cancelled successfully", data=cancelled_order)


# ── Admin endpoints ────────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=PaginatedApiResponse[OrderOut])
def list_all_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: str | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """Admin: list all orders with optional status filter and search query."""
    total = order_crud.count_all(db, status=status, search=search)
    orders = order_crud.get_all(db, skip=skip, limit=limit, status=status, search=search)
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
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """Admin: update order status (confirm → ship → deliver)."""
    order = order_crud.get_by_id(db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    updated = order_crud.update_status(db, order=order, new_status=status_in.status)
    
    # order.user is eagerly loaded due to joinedload in get_by_id
    if updated.user:
        background_tasks.add_task(
            send_order_status_update_email,
            email_to=updated.user.email,
            order_id=str(updated.id),
            status=status_in.status.value if hasattr(status_in.status, "value") else str(status_in.status),
            total_amount=updated.total_amount,
            user_name=updated.user.full_name or updated.user.email.split("@")[0],
            items=[{
                "name": item.product.name,
                "image_url": item.product.image_url,
                "quantity": item.quantity,
                "price": float(item.unit_price)
            } for item in updated.items]
        )
        
    return ApiResponse(message=f"Order status updated to {status_in.status}", data=updated)
