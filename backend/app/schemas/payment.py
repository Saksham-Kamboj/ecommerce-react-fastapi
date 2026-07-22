import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class PaymentCreate(BaseModel):
    shipping_address_id: uuid.UUID
    shipping_name: str = Field(..., min_length=1, max_length=255)
    shipping_phone: str | None = Field(None, max_length=20)
    notes: str | None = Field(None, max_length=500)


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
