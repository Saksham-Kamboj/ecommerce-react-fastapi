import uuid
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_admin, get_db
from app.crud.crud_notification import notification_crud
from app.models.user import User
from app.schemas.notification import NotificationOut
from app.schemas.response import ApiResponse

router = APIRouter()

@router.get("/", response_model=ApiResponse[List[NotificationOut]])
def get_unread_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Get all unread notifications for the admin."""
    notifications = notification_crud.get_unread(db, skip=skip, limit=limit)
    return ApiResponse(message="Notifications retrieved", data=notifications)

@router.patch("/read-all", response_model=ApiResponse[dict])
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """Mark all unread notifications as read."""
    notification_crud.mark_all_as_read(db)
    return ApiResponse(message="All notifications marked as read", data={"success": True})

@router.patch("/{id}/read", response_model=ApiResponse[NotificationOut])
def mark_notification_as_read(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """Mark a specific notification as read."""
    notification = notification_crud.get(db, id=id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification = notification_crud.mark_as_read(db, db_obj=notification)
    return ApiResponse(message="Notification marked as read", data=notification)
