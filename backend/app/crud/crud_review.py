from typing import List, Optional, Tuple
import uuid

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.crud.base import CRUDBase
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewUpdate

class CRUDReview(CRUDBase[Review, ReviewCreate, ReviewUpdate]):
    def get_by_product(
        self, db: Session, *, product_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> Tuple[List[Review], int]:
        query = db.query(self.model).filter(self.model.product_id == product_id)
        total = query.count()
        reviews = (
            query.order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return reviews, total
        
    def get_by_user_and_product(
        self, db: Session, *, user_id: uuid.UUID, product_id: uuid.UUID
    ) -> Optional[Review]:
        return db.query(self.model).filter(
            self.model.user_id == user_id, 
            self.model.product_id == product_id
        ).first()

    def create_with_user(
        self, db: Session, *, obj_in: ReviewCreate, user_id: uuid.UUID, product_id: uuid.UUID
    ) -> Review:
        db_obj = self.model(
            rating=obj_in.rating,
            comment=obj_in.comment,
            user_id=user_id,
            product_id=product_id,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

review = CRUDReview(Review)
