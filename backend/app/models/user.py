import uuid
from datetime import datetime, date

from sqlalchemy import Boolean, DateTime, Date, String, Text, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    role: Mapped[str] = mapped_column(String(50), default="user", server_default="user", nullable=False)
    access_token: Mapped[str] = mapped_column(String, nullable=True)
    otp_code: Mapped[str] = mapped_column(String(6), nullable=True)
    otp_expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # Profile fields
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=True)
    bio: Mapped[str] = mapped_column(Text, nullable=True)

    # Address fields
    address_line1: Mapped[str] = mapped_column(String(255), nullable=True)
    address_line2: Mapped[str] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=True)
    state: Mapped[str] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[str] = mapped_column(String(20), nullable=True)
    country: Mapped[str] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    cart = relationship("Cart", back_populates="user", uselist=False, cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan", order_by="WishlistItem.created_at")
    orders = relationship("Order", back_populates="user", order_by="Order.created_at.desc()")
