from datetime import datetime
import uuid
from pydantic import BaseModel, ConfigDict, Field

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    comment: str | None = None

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    rating: int | None = Field(None, ge=1, le=5, description="Rating from 1 to 5")
    comment: str | None = None

class ReviewUser(BaseModel):
    id: uuid.UUID
    full_name: str | None
    
    model_config = ConfigDict(from_attributes=True)

class ReviewOut(ReviewBase):
    id: uuid.UUID
    product_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    user: ReviewUser | None = None

    model_config = ConfigDict(from_attributes=True)
