from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, constr

from app.models.coupon import DiscountType


class CouponBase(BaseModel):
    code: str = Field(..., max_length=50)
    discount_type: DiscountType = Field(default=DiscountType.percentage)
    discount_value: float = Field(..., gt=0)
    
    min_order_value: float | None = Field(default=None, ge=0)
    max_discount: float | None = Field(default=None, ge=0)
    
    is_active: bool = True
    usage_limit: int | None = Field(default=None, ge=1)
    
    valid_from: datetime | None = None
    valid_until: datetime | None = None


class CouponCreate(CouponBase):
    pass


class CouponUpdate(BaseModel):
    code: str | None = Field(default=None, max_length=50)
    discount_type: DiscountType | None = None
    discount_value: float | None = Field(default=None, gt=0)
    min_order_value: float | None = Field(default=None, ge=0)
    max_discount: float | None = Field(default=None, ge=0)
    is_active: bool | None = None
    usage_limit: int | None = Field(default=None, ge=1)
    valid_from: datetime | None = None
    valid_until: datetime | None = None


class CouponOut(CouponBase):
    id: UUID
    usage_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CouponValidateRequest(BaseModel):
    code: str
    cart_total: float = Field(..., ge=0)


class CouponValidateResponse(BaseModel):
    is_valid: bool
    discount_amount: float
    message: str | None = None
    coupon: CouponOut | None = None
