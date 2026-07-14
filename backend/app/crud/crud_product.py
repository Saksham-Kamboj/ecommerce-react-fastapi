from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.crud.base import CRUDBase
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate

class CRUDProduct(CRUDBase[Product, ProductCreate, ProductUpdate]):
    def get_multi_active(self, db: Session, skip: int = 0, limit: int = 100, search: str | None = None, sort_by: str = "created_at", sort_order: str = "desc") -> list[Product]:
        query = db.query(self.model).filter(self.model.is_active == True)
        if search:
            query = query.filter(
                or_(
                    self.model.name.ilike(f"%{search}%"),
                    self.model.description.ilike(f"%{search}%")
                )
            )
            
        if sort_by in ["created_at", "updated_at"]:
            sort_column = getattr(self.model, sort_by)
            if sort_order == "desc":
                query = query.order_by(sort_column.desc())
            else:
                query = query.order_by(sort_column.asc())
                
        return query.offset(skip).limit(limit).all()

    def count_active(self, db: Session, search: str | None = None) -> int:
        query = db.query(self.model).filter(self.model.is_active == True)
        if search:
            query = query.filter(
                or_(
                    self.model.name.ilike(f"%{search}%"),
                    self.model.description.ilike(f"%{search}%")
                )
            )
        return query.count()

product = CRUDProduct(Product)
