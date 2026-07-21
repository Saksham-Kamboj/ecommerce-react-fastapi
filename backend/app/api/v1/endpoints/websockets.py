from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, HTTPException, status
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from pydantic import ValidationError

from app.core.config import settings
from app.db.session import SessionLocal
from app.schemas.token import TokenPayload
from app.crud.crud_user import user as user_crud
from app.services.websocket import manager

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_admin_ws(token: str, db: Session) -> bool:
    """Verify that the provided token belongs to a superadmin."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        return None
    
    user = user_crud.get(db, id=token_data.sub)
    if not user or not user.is_active or user.role != "superadmin":
        return None
    
    if user.access_token != token:
        return None
        
    return user

@router.websocket("/notifications")
async def websocket_notifications(
    websocket: WebSocket,
    token: str = Query(...)
):
    db = SessionLocal()
    try:
        user = await get_current_admin_ws(token, db)
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        await manager.connect(websocket, user.id)
        try:
            while True:
                # Keep the connection open and listen for any messages from client
                # Client might just send ping or nothing, we just wait.
                data = await websocket.receive_text()
        except WebSocketDisconnect:
            manager.disconnect(websocket, user.id)
    finally:
        db.close()
