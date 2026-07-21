import uuid
from typing import List

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationUpdate

from fastapi import BackgroundTasks
from app.services.websocket import manager

class CRUDNotification(CRUDBase[Notification, NotificationCreate, NotificationUpdate]):
    def create_with_broadcast(self, db: Session, *, obj_in: NotificationCreate, background_tasks: BackgroundTasks) -> Notification:
        notification = super().create(db, obj_in=obj_in)
        data = {
            "id": str(notification.id),
            "title": notification.title,
            "message": notification.message,
            "type": notification.type,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat() if notification.created_at else None
        }
        background_tasks.add_task(manager.broadcast_admin_notification, data)
        return notification

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
