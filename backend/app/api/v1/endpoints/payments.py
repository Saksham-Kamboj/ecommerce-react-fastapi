import hashlib
import hmac
import json
from typing import Any

import razorpay
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.core.config import settings
from app.crud.crud_order import order_crud
from app.crud.crud_cart import cart_crud
from app.models.order import OrderStatus
from app.models.payment import Payment, PaymentStatus
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentCreateOut, PaymentOut, PaymentVerify
from app.schemas.response import ApiResponse
from app.utils.email import send_order_confirmation_email
from app.crud.crud_notification import notification_crud
from app.schemas.notification import NotificationCreate

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
    order = order_crud.get_by_id(db, order_id=payment_in.order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != OrderStatus.pending:
        raise HTTPException(status_code=400, detail="Payment can be created only for pending orders")

    # Cancel any previous non-captured payments for this order
    previous_payments = (
        db.query(Payment)
        .filter(
            Payment.order_id == order.id,
            Payment.status == PaymentStatus.created,
        )
        .all()
    )
    for p in previous_payments:
        p.status = PaymentStatus.cancelled
    if previous_payments:
        db.commit()

    amount = _amount_to_paise(order.total_amount)
    razorpay_order = _get_razorpay_client().order.create(
        {
            "amount": amount,
            "currency": settings.RAZORPAY_CURRENCY,
            "receipt": str(order.id)[:40],
            "payment_capture": 1,
            "notes": {"order_id": str(order.id), "user_id": str(current_user.id)},
        }
    )

    payment = Payment(
        order_id=order.id,
        user_id=current_user.id,
        amount=order.total_amount,
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
            order_id=order.id,
            razorpay_order_id=razorpay_order["id"],
            amount=amount,
            currency=settings.RAZORPAY_CURRENCY,
            key_id=settings.RAZORPAY_KEY_ID,
        ),
    )


@router.post("/verify", response_model=ApiResponse[PaymentOut])
def verify_payment(
    payment_in: PaymentVerify,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    order = order_crud.get_by_id(db, order_id=payment_in.order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")

    payment = (
        db.query(Payment)
        .filter(
            Payment.order_id == order.id,
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

    payment.provider_payment_id = payment_in.razorpay_payment_id
    payment.provider_signature = payment_in.razorpay_signature
    payment.status = PaymentStatus.captured
    order.status = OrderStatus.confirmed

    db.add(payment)
    db.add(order)
    db.commit()

    # Clear cart only after payment is confirmed
    cart = cart_crud.get_cart_by_user(db, user_id=current_user.id)
    cart_crud.clear_cart(db, cart_id=cart.id)
    
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
    notification_crud.create(
        db,
        obj_in=NotificationCreate(
            title="Payment Successful",
            message=f"Payment for order #{str(order.id)[:8]} was successful",
            type="payment_success"
        )
    )

    db.refresh(payment)
    return ApiResponse(message="Payment verified successfully", data=payment)
