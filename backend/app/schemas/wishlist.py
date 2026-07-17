import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.schemas.product import ProductOut


class WishlistItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    product_id: uuid.UUID
    created_at: datetime
    product: ProductOut
