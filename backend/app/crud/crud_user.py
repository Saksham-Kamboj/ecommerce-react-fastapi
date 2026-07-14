import uuid
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.security import get_password_hash, verify_password
from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserUpdateSelf


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100, search: str | None = None, sort_by: str = "created_at", sort_order: str = "desc") -> list[User]:
        query = db.query(self.model)
        if search:
            query = query.filter(
                or_(
                    self.model.full_name.ilike(f"%{search}%"),
                    self.model.email.ilike(f"%{search}%")
                )
            )
            
        if sort_by in ["created_at", "updated_at"]:
            sort_column = getattr(self.model, sort_by)
            if sort_order == "desc":
                query = query.order_by(sort_column.desc())
            else:
                query = query.order_by(sort_column.asc())
                
        return query.offset(skip).limit(limit).all()

    def count(self, db: Session, search: str | None = None) -> int:
        query = db.query(self.model)
        if search:
            query = query.filter(
                or_(
                    self.model.full_name.ilike(f"%{search}%"),
                    self.model.email.ilike(f"%{search}%")
                )
            )
        return query.count()

    def create(self, db: Session, obj_in: UserCreate) -> User:
        db_obj = User(
            email=obj_in.email,
            full_name=obj_in.full_name,
            hashed_password=get_password_hash(obj_in.password),
            is_active=obj_in.is_active,
            role=obj_in.role.value if hasattr(obj_in.role, 'value') else obj_in.role,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: User, obj_in: UserUpdate | UserUpdateSelf | dict) -> User:
        """Override to hash password if provided."""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        # Hash password if it's being updated
        if "password" in update_data and update_data["password"]:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        else:
            update_data.pop("password", None)

        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_self(self, db: Session, db_obj: User, obj_in: UserUpdateSelf) -> User:
        """User updates their own profile (no role/is_active changes allowed)."""
        return self.update(db, db_obj=db_obj, obj_in=obj_in)

    def change_password(self, db: Session, db_obj: User, current_password: str, new_password: str) -> User | None:
        """Verify current password then update to new one. Returns None if current password wrong."""
        if not verify_password(current_password, db_obj.hashed_password):
            return None
        db_obj.hashed_password = get_password_hash(new_password)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def authenticate(self, db: Session, email: str, password: str) -> User | None:
        user = self.get_by_email(db, email=email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user


user = CRUDUser(User)
