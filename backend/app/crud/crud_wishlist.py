import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.wishlist import WishlistItem
from app.models.product import Product


class CRUDWishlist:
    def get_by_user(self, db: Session, user_id: uuid.UUID) -> list[WishlistItem]:
        return (
            db.query(WishlistItem)
            .filter(WishlistItem.user_id == user_id)
            .order_by(WishlistItem.created_at.asc())
            .all()
        )

    def get_item(self, db: Session, user_id: uuid.UUID, product_id: uuid.UUID) -> WishlistItem | None:
        return (
            db.query(WishlistItem)
            .filter(WishlistItem.user_id == user_id, WishlistItem.product_id == product_id)
            .first()
        )

    def add(self, db: Session, user_id: uuid.UUID, product_id: uuid.UUID) -> WishlistItem:
        # Validate product exists and is active
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if not product.is_active:
            raise HTTPException(status_code=400, detail="Product is not active")

        # Idempotent — return existing if already wishlisted
        existing = self.get_item(db, user_id=user_id, product_id=product_id)
        if existing:
            return existing

        item = WishlistItem(user_id=user_id, product_id=product_id)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def remove(self, db: Session, user_id: uuid.UUID, product_id: uuid.UUID) -> bool:
        item = self.get_item(db, user_id=user_id, product_id=product_id)
        if not item:
            return False
        db.delete(item)
        db.commit()
        return True

    def is_wishlisted(self, db: Session, user_id: uuid.UUID, product_id: uuid.UUID) -> bool:
        return self.get_item(db, user_id=user_id, product_id=product_id) is not None


wishlist_crud = CRUDWishlist()
