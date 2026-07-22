import uuid
from typing import List

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate


class CRUDAddress(CRUDBase[Address, AddressCreate, AddressUpdate]):
    def create_with_user(self, db: Session, *, obj_in: AddressCreate, user_id: uuid.UUID) -> Address:
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_user(self, db: Session, *, user_id: uuid.UUID) -> List[Address]:
        return db.query(Address).filter(Address.user_id == user_id).order_by(Address.created_at.desc()).all()

    def set_default(self, db: Session, *, db_obj: Address) -> Address:
        # Unset all other defaults for this user
        db.query(Address).filter(Address.user_id == db_obj.user_id).update({"is_default": False})
        
        # Set this one as default
        db_obj.is_default = True
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


address = CRUDAddress(Address)
