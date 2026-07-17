import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus
from app.schemas.product import ProductCartOut


class ShippingAddress(BaseModel):
    """Shipping address submitted at checkout time."""
    name: str = Field(..., min_length=1, max_length=255)
    phone: str | None = Field(None, max_length=20)
    address_line1: str = Field(..., min_length=1, max_length=255)
    address_line2: str | None = Field(None, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)
    country: str = Field(..., min_length=1, max_length=100)


class OrderCreate(BaseModel):
    """Request body for placing a new order."""
    shipping_address: ShippingAddress
    notes: str | None = Field(None, max_length=500)


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    unit_price: float
    product: ProductCartOut


class PaymentSummary(BaseModel):
    """Embedded payment info inside OrderOut."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: str
    amount: float
    currency: str
    provider: str
    provider_order_id: str
    provider_payment_id: str | None
    created_at: datetime


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    status: OrderStatus
    total_amount: float

    # Shipping snapshot
    shipping_name: str
    shipping_phone: str | None
    shipping_address_line1: str
    shipping_address_line2: str | None
    shipping_city: str
    shipping_state: str
    shipping_postal_code: str
    shipping_country: str

    notes: str | None
    items: list[OrderItemOut]
    payments: list[PaymentSummary] = []
    created_at: datetime
    updated_at: datetime


class OrderStatusUpdate(BaseModel):
    """Admin-only: update order status."""
    status: OrderStatus
