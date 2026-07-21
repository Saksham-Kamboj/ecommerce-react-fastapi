import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ShippingAddressIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    address_line1: str = Field(..., min_length=1, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)
    country: str = Field(..., min_length=1, max_length=100)


class PaymentCreate(BaseModel):
    shipping_address: ShippingAddressIn
    notes: Optional[str] = Field(None, max_length=500)


class PaymentCreateOut(BaseModel):
    razorpay_order_id: str
    amount: int
    currency: str
    key_id: str


class PaymentVerify(BaseModel):
    razorpay_order_id: str = Field(..., min_length=1)
    razorpay_payment_id: str = Field(..., min_length=1)
    razorpay_signature: str = Field(..., min_length=1)


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    order_id: uuid.UUID
    user_id: uuid.UUID
    amount: float
    currency: str
    provider: str
    provider_order_id: str
    provider_payment_id: str | None
    status: str
    created_at: datetime
    updated_at: datetime
