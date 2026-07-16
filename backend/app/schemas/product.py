import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.category import CategoryOut

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    price: float = Field(..., ge=0.0)
    stock_quantity: int = Field(0, ge=0)
    image_url: str | None = None
    category_id: uuid.UUID | None = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    price: float | None = Field(None, ge=0.0)
    stock_quantity: int | None = Field(None, ge=0)
    image_url: str | None = None
    category_id: uuid.UUID | None = None
    is_active: bool | None = None

class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    category: CategoryOut | None = None

class ProductCartOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
