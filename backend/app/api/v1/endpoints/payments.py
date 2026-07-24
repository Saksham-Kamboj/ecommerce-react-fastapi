import hashlib
import hmac
import json
import uuid
from typing import Any

import razorpay
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.core.config import settings
from app.crud.crud_order import order_crud
from app.crud.crud_cart import cart_crud
from app.crud.crud_address import address as address_crud
from app.models.order import Order, OrderItem, OrderStatus
from app.models.payment import Payment, PaymentStatus
from app.models.user import User
from app.schemas.order import OrderOut
from app.schemas.payment import PaymentCreate, PaymentCreateOut, PaymentOut, PaymentVerify
from app.schemas.response import ApiResponse
from app.utils.email import send_order_confirmation_email
from app.crud.crud_notification import notification_crud
from app.schemas.notification import NotificationCreate
from app.crud.crud_coupon import coupon as coupon_crud
from app.models.coupon import DiscountType
from datetime import datetime, timezone

router = APIRouter()


def _ensure_razorpay_configured() -> None:
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay is not configured")


def _get_razorpay_client() -> razorpay.Client:
    _ensure_razorpay_configured()
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def _amount_to_paise(amount: float) -> int:
    return int(round(float(amount) * 100))


@router.post("/create", response_model=ApiResponse[PaymentCreateOut])
def create_payment_order(
    payment_in: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Create payment record without requiring existing order."""
    cart = cart_crud.get_cart_by_user(db, user_id=current_user.id)
    if not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Calculate total from cart
    total = sum(item.product.price * item.quantity for item in cart.items)

    # Validate address
    address = address_crud.get(db, id=payment_in.shipping_address_id)
    if not address or address.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Invalid shipping address")

    discount_amount = 0.0
    if payment_in.coupon_code:
        coupon = coupon_crud.get_by_code(db, code=payment_in.coupon_code)
        if not coupon or not coupon.is_active:
            raise HTTPException(status_code=400, detail="Invalid or inactive coupon code")
        
        now = datetime.now(timezone.utc)
        if coupon.valid_from and coupon.valid_from > now:
            raise HTTPException(status_code=400, detail="Coupon is not valid yet")
        if coupon.valid_until and coupon.valid_until < now:
            raise HTTPException(status_code=400, detail="Coupon has expired")
        if coupon.usage_limit and coupon.usage_count >= coupon.usage_limit:
            raise HTTPException(status_code=400, detail="Coupon usage limit reached")
        if coupon.min_order_value and total < float(coupon.min_order_value):
            raise HTTPException(status_code=400, detail=f"Minimum order value of ₹{coupon.min_order_value} required")
            
        if coupon.discount_type == DiscountType.fixed:
            discount_amount = float(coupon.discount_value)
        else:
            discount_amount = total * (float(coupon.discount_value) / 100)
            if coupon.max_discount:
                discount_amount = min(discount_amount, float(coupon.max_discount))
        
        discount_amount = min(discount_amount, total)
        
    final_total = max(0.0, total - discount_amount)

    amount = _amount_to_paise(final_total)
    razorpay_order = _get_razorpay_client().order.create(
        {
            "amount": amount,
            "currency": settings.RAZORPAY_CURRENCY,
            "receipt": str(current_user.id)[:40],
            "payment_capture": 1,
            "notes": {
                "user_id": str(current_user.id),
                "address_id": str(address.id),
                "shipping_name": payment_in.shipping_name,
                "shipping_phone": payment_in.shipping_phone or "",
                "notes": payment_in.notes or "",
                "coupon_code": payment_in.coupon_code or "",
            },
        }
    )

    payment = Payment(
        user_id=current_user.id,
        amount=final_total,
        currency=settings.RAZORPAY_CURRENCY,
        provider_order_id=razorpay_order["id"],
        status=PaymentStatus.created,
        raw_response=json.dumps(razorpay_order),
    )
    db.add(payment)
    db.commit()

    return ApiResponse(
        message="Payment order created",
        data=PaymentCreateOut(
            razorpay_order_id=razorpay_order["id"],
            amount=amount,
            currency=settings.RAZORPAY_CURRENCY,
            key_id=settings.RAZORPAY_KEY_ID,
        ),
    )


@router.post("/verify", response_model=ApiResponse[OrderOut])
def verify_payment(
    payment_in: PaymentVerify,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Verify payment signature, then CREATE order from cart with confirmed status."""
    payment = (
        db.query(Payment)
        .filter(
            Payment.user_id == current_user.id,
            Payment.provider_order_id == payment_in.razorpay_order_id,
        )
        .order_by(Payment.created_at.desc())
        .first()
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment order not found")

    _ensure_razorpay_configured()

    # Verify signature — mark payment as failed on mismatch
    message = f"{payment_in.razorpay_order_id}|{payment_in.razorpay_payment_id}"
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected, payment_in.razorpay_signature):
        payment.status = PaymentStatus.failed
        db.add(payment)
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Get cart
    cart = cart_crud.get_cart_by_user(db, user_id=current_user.id)
    if not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Get shipping details from payment notes
    razorpay_data = json.loads(payment.raw_response)
    shipping_notes = razorpay_data.get("notes", {})
    
    address_id_str = shipping_notes.get("address_id")
    address = None
    if address_id_str:
        try:
            address = address_crud.get(db, id=uuid.UUID(address_id_str))
        except ValueError:
            pass

    if not address:
        raise HTTPException(status_code=400, detail="Shipping address not found in system")

    total = sum(item.product.price * item.quantity for item in cart.items)
    
    # Process Coupon again for safety
    coupon_code = shipping_notes.get("coupon_code")
    discount_amount = 0.0
    coupon = None
    if coupon_code:
        coupon = coupon_crud.get_by_code(db, code=coupon_code)
        if coupon:
            if coupon.discount_type == DiscountType.fixed:
                discount_amount = float(coupon.discount_value)
            else:
                discount_amount = total * (float(coupon.discount_value) / 100)
                if coupon.max_discount:
                    discount_amount = min(discount_amount, float(coupon.max_discount))
            discount_amount = min(discount_amount, total)
            
            # Increment coupon usage
            coupon.usage_count += 1
            db.add(coupon)
    
    final_total = max(0.0, total - discount_amount)
    
    order = Order(
        user_id=current_user.id,
        status=OrderStatus.confirmed,
        total_amount=round(final_total, 2),
        coupon_id=coupon.id if coupon else None,
        discount_amount=round(discount_amount, 2),
        shipping_name=shipping_notes.get("shipping_name", ""),
        shipping_phone=shipping_notes.get("shipping_phone"),
        shipping_address_line1=address.address_line1,
        shipping_address_line2=address.address_line2,
        shipping_city=address.city,
        shipping_state=address.state,
        shipping_postal_code=address.postal_code,
        shipping_country=address.country,
        notes=shipping_notes.get("notes"),
    )
    db.add(order)
    db.flush()  # Get order.id

    # Add items from cart to order
    for cart_item in cart.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            unit_price=cart_item.product.price,
        )
        db.add(order_item)

    db.commit()

    # Update payment status + link to order
    payment.provider_payment_id = payment_in.razorpay_payment_id
    payment.provider_signature = payment_in.razorpay_signature
    payment.status = PaymentStatus.captured
    payment.order_id = order.id
    db.add(payment)
    db.commit()

    # Decrement stock (ONLY after order confirmed)
    for item in order.items:
        item.product.stock_quantity -= item.quantity
    db.commit()

    # Clear cart
    cart_crud.clear_cart(db, cart_id=cart.id)

    # Send confirmation email
    background_tasks.add_task(
        send_order_confirmation_email,
        email_to=current_user.email,
        order_id=str(order.id),
        total_amount=order.total_amount,
        user_name=current_user.full_name or current_user.email.split("@")[0],
        items=[{
            "name": item.product.name,
            "image_url": item.product.image_url,
            "quantity": item.quantity,
            "price": float(item.unit_price)
        } for item in order.items]
    )

    # Create notification
    notification_crud.create_with_broadcast(
        db,
        obj_in=NotificationCreate(
            title="Payment Successful",
            message=f"Payment for order #{str(order.id)[:8]} was successful",
            type="payment_success"
        ),
        background_tasks=background_tasks
    )

    db.refresh(order)
    return ApiResponse(message="Payment verified. Order Confirmed.", data=order)
