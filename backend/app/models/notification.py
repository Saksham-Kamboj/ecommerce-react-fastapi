import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, String, Text, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. user_created, order_placed, payment_success
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
