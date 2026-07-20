import uuid
from typing import List

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationUpdate

class CRUDNotification(CRUDBase[Notification, NotificationCreate, NotificationUpdate]):
    def get_unread(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Notification]:
        return db.query(self.model).filter(self.model.is_read == False).order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()

    def mark_as_read(self, db: Session, *, db_obj: Notification) -> Notification:
        db_obj.is_read = True
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
        
    def mark_all_as_read(self, db: Session) -> None:
        db.query(self.model).filter(self.model.is_read == False).update({"is_read": True})
        db.commit()

notification_crud = CRUDNotification(Notification)
