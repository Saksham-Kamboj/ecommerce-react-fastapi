import uuid
from datetime import datetime
from pydantic import BaseModel

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str
    is_read: bool = False

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    is_read: bool

class NotificationOut(NotificationBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True
