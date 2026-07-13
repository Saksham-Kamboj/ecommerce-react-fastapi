from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate

class CRUDProduct(CRUDBase[Product, ProductCreate, ProductUpdate]):
    def get_multi_active(self, db: Session, skip: int = 0, limit: int = 100) -> list[Product]:
        return db.query(self.model).filter(self.model.is_active == True).offset(skip).limit(limit).all()

product = CRUDProduct(Product)
