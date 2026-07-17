from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.crud.base import CRUDBase
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate

class CRUDCategory(CRUDBase[Category, CategoryCreate, CategoryUpdate]):
    def get_by_slug(self, db: Session, slug: str) -> Category | None:
        return db.query(self.model).filter(self.model.slug == slug).first()

    def get_multi(
        self, db: Session, skip: int = 0, limit: int = 100, search: str | None = None
    ) -> list[Category]:
        query = db.query(self.model)
        if search:
            query = query.filter(
                self.model.name.ilike(f"%{search}%")
            )
        return query.order_by(self.model.name.asc()).offset(skip).limit(limit).all()

    def count(self, db: Session, search: str | None = None) -> int:
        query = db.query(self.model)
        if search:
            query = query.filter(
                self.model.name.ilike(f"%{search}%")
            )
        return query.count()

category = CRUDCategory(Category)
