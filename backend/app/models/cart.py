import uuid
from datetime import datetime

from sqlalchemy import Integer, ForeignKey, DateTime, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

class Cart(Base):
    __tablename__ = "carts"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"), unique=True, index=True, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan", order_by="CartItem.created_at")


class CartItem(Base):
    __tablename__ = "cart_items"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    cart_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("carts.id"), nullable=False, index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")
