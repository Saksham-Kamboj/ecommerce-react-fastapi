import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_admin
from app.models.user import User
from app.crud.crud_user import user as user_crud
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.schemas.response import ApiResponse, PaginatedApiResponse, paginate

router = APIRouter()


@router.post("/", response_model=ApiResponse[UserOut])
def create_user(user_in: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    existing = user_crud.get_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = user_crud.create(db, obj_in=user_in)
    return ApiResponse(message="User created successfully", data=new_user)


@router.get("/", response_model=PaginatedApiResponse[UserOut])
def list_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    total_items = user_crud.count(db)
    users = user_crud.get_multi(db, skip=skip, limit=limit)
    return paginate(
        items=users,
        total_items=total_items,
        skip=skip,
        limit=limit,
        message="User list retrieved successfully"
    )


@router.get("/{user_id}", response_model=ApiResponse[UserOut])
def get_user(user_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    db_user = user_crud.get(db, id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return ApiResponse(message="User retrieved successfully", data=db_user)


@router.put("/{user_id}", response_model=ApiResponse[UserOut])
def update_user(user_id: uuid.UUID, user_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    db_user = user_crud.get(db, id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    updated_user = user_crud.update(db, db_obj=db_user, obj_in=user_in)
    return ApiResponse(message="User updated successfully", data=updated_user)


@router.delete("/{user_id}", response_model=ApiResponse[None])
def delete_user(user_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    db_user = user_crud.remove(db, id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return ApiResponse(message="User deleted successfully", data=None)
