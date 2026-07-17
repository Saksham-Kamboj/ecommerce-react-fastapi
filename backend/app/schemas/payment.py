import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PaymentCreate(BaseModel):
    order_id: uuid.UUID


class PaymentCreateOut(BaseModel):
    order_id: uuid.UUID
    razorpay_order_id: str
    amount: int
    currency: str
    key_id: str


class PaymentVerify(BaseModel):
    order_id: uuid.UUID
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
