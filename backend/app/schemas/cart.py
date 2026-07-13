import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.product import ProductCartOut

class CartItemBase(BaseModel):
    quantity: int

class CartItemCreate(CartItemBase):
    product_id: uuid.UUID

class CartItemUpdate(CartItemBase):
    pass

class CartItemOut(CartItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    product: ProductCartOut

class CartOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    items: list[CartItemOut]
    total_price: float
