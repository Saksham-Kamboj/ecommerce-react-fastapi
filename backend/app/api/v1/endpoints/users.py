import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_admin, get_current_active_user
from app.models.user import User
from app.crud.crud_user import user as user_crud
from app.schemas.user import UserCreate, UserOut, UserUpdate, UserUpdateSelf, ChangePasswordRequest
from app.schemas.response import ApiResponse, PaginatedApiResponse, paginate
from app.schemas.admin import UserDetailOut, RecentOrderBrief
from app.crud.crud_order import order_crud

router = APIRouter()


# ── Self-service (authenticated user) ─────────────────────────────────────────

@router.get("/me", response_model=ApiResponse[UserOut])
def get_me(current_user: User = Depends(get_current_active_user)):
    """Get current logged-in user's profile."""
    return ApiResponse(message="Current user retrieved successfully", data=current_user)


@router.put("/me", response_model=ApiResponse[UserOut])
def update_me(
    user_in: UserUpdateSelf,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update current user's own profile (name, phone, bio, address)."""
    updated_user = user_crud.update_self(db, db_obj=current_user, obj_in=user_in)
    return ApiResponse(message="Profile updated successfully", data=updated_user)


@router.post("/me/change-password", response_model=ApiResponse[None])
def change_my_password(
    req: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Change password — requires current password verification."""
    result = user_crud.change_password(
        db,
        db_obj=current_user,
        current_password=req.current_password,
        new_password=req.new_password,
    )
    if result is None:
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    return ApiResponse(message="Password changed successfully", data=None)


# ── Admin-only ─────────────────────────────────────────────────────────────────

@router.post("/", response_model=ApiResponse[UserOut])
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    existing = user_crud.get_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = user_crud.create(db, obj_in=user_in)
    return ApiResponse(message="User created successfully", data=new_user)


@router.get("/", response_model=PaginatedApiResponse[UserOut])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    search: str | None = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    total_items = user_crud.count(db, search=search)
    users = user_crud.get_multi(
        db, skip=skip, limit=limit, search=search,
        sort_by=sort_by, sort_order=sort_order
    )
    return paginate(
        items=users,
        total_items=total_items,
        skip=skip,
        limit=limit,
        message="User list retrieved successfully",
    )


@router.get("/{user_id}", response_model=ApiResponse[UserOut])
def get_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    db_user = user_crud.get(db, id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return ApiResponse(message="User retrieved successfully", data=db_user)


@router.get("/{user_id}/details", response_model=ApiResponse[UserDetailOut])
def get_user_details(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    db_user = user_crud.get(db, id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    recent_db_orders = order_crud.get_by_user(db, user_id=user_id, limit=10000)
    recent_orders = []
    for o in recent_db_orders:
        payment_status = None
        if o.payments:
            status_order = {"captured": 0, "created": 1, "failed": 2, "cancelled": 3}
            sorted_payments = sorted(
                o.payments,
                key=lambda p: (
                    status_order.get(p.status if isinstance(p.status, str) else getattr(p.status, 'value', p.status), 99),
                    -p.created_at.timestamp(),
                ),
            )
            p_status = sorted_payments[0].status
            payment_status = p_status if isinstance(p_status, str) else getattr(p_status, 'value', str(p_status))
            
        items_count = sum(item.quantity for item in o.items) if getattr(o, 'items', None) else 0

        recent_orders.append(RecentOrderBrief(
            id=o.id,
            created_at=o.created_at,
            total_amount=float(o.total_amount),
            status=o.status,
            payment_status=payment_status,
            items_count=items_count,
            user_name=db_user.full_name or db_user.email
        ))
        
    user_detail = UserDetailOut.model_validate(db_user)
    user_detail.recent_orders = recent_orders
    
    return ApiResponse(message="User details retrieved successfully", data=user_detail)


@router.put("/{user_id}", response_model=ApiResponse[UserOut])
def update_user(
    user_id: uuid.UUID,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    db_user = user_crud.get(db, id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    updated_user = user_crud.update(db, db_obj=db_user, obj_in=user_in)
    return ApiResponse(message="User updated successfully", data=updated_user)


@router.delete("/{user_id}", response_model=ApiResponse[None])
def delete_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    db_user = user_crud.remove(db, id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return ApiResponse(message="User deleted successfully", data=None)
