import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api import deps

from app.models.coupon import DiscountType
from app.models.user import User
from app.crud.crud_coupon import coupon as coupon_crud
from app.schemas.response import ApiResponse, PaginatedApiResponse, paginate
from app.schemas.coupon import CouponOut, CouponCreate, CouponUpdate, CouponValidateRequest, CouponValidateResponse

router = APIRouter()


@router.get("/", response_model=PaginatedApiResponse[CouponOut])
def read_coupons(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    search: str | None = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Retrieve coupons (admin only).
    """
    total_items = coupon_crud.count(db, search=search)
    coupons = coupon_crud.get_multi(db, skip=skip, limit=limit, search=search)
    return paginate(
        items=coupons,
        total_items=total_items,
        skip=skip,
        limit=limit,
        message="Coupons retrieved"
    )


@router.get("/active", response_model=ApiResponse[list[CouponOut]])
def read_active_coupons(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve active coupons for users.
    """
    return ApiResponse(message="Active coupons retrieved", data=coupon_crud.get_active_coupons(db))


@router.post("/", response_model=ApiResponse[CouponOut])
def create_coupon(
    *,
    db: Session = Depends(deps.get_db),
    coupon_in: CouponCreate,
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Create new coupon.
    """
    coupon = coupon_crud.get_by_code(db, code=coupon_in.code)
    if coupon:
        raise HTTPException(
            status_code=400,
            detail="The coupon with this code already exists.",
        )
    coupon = coupon_crud.create(db, obj_in=coupon_in)
    return ApiResponse(message="Coupon created successfully", data=coupon)


@router.put("/{coupon_id}", response_model=ApiResponse[CouponOut])
def update_coupon(
    *,
    db: Session = Depends(deps.get_db),
    coupon_id: uuid.UUID,
    coupon_in: CouponUpdate,
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Update a coupon.
    """
    coupon = coupon_crud.get(db, id=coupon_id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
        
    if coupon_in.code:
        existing = coupon_crud.get_by_code(db, code=coupon_in.code)
        if existing and existing.id != coupon_id:
            raise HTTPException(
                status_code=400,
                detail="The coupon with this code already exists.",
            )
            
    coupon = coupon_crud.update(db, db_obj=coupon, obj_in=coupon_in)
    return ApiResponse(message="Coupon updated successfully", data=coupon)


@router.delete("/{coupon_id}", response_model=ApiResponse)
def delete_coupon(
    *,
    db: Session = Depends(deps.get_db),
    coupon_id: uuid.UUID,
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Delete a coupon.
    """
    coupon = coupon_crud.get(db, id=coupon_id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    coupon_crud.remove(db, id=coupon_id)
    return ApiResponse(message="Coupon deleted successfully")


@router.post("/validate", response_model=ApiResponse[CouponValidateResponse])
def validate_coupon(
    *,
    db: Session = Depends(deps.get_db),
    req: CouponValidateRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Validate a coupon and calculate discount.
    """
    coupon = coupon_crud.get_by_code(db, code=req.code)
    
    if not coupon:
        return ApiResponse(
            message="Invalid coupon code", 
            data=CouponValidateResponse(is_valid=False, discount_amount=0)
        )
        
    if not coupon.is_active:
        return ApiResponse(
            message="Coupon is no longer active", 
            data=CouponValidateResponse(is_valid=False, discount_amount=0)
        )
        
    now = datetime.now(timezone.utc)
    if coupon.valid_from and coupon.valid_from > now:
        return ApiResponse(
            message="Coupon is not valid yet", 
            data=CouponValidateResponse(is_valid=False, discount_amount=0)
        )
        
    if coupon.valid_until and coupon.valid_until < now:
        return ApiResponse(
            message="Coupon has expired", 
            data=CouponValidateResponse(is_valid=False, discount_amount=0)
        )
        
    if coupon.usage_limit and coupon.usage_count >= coupon.usage_limit:
        return ApiResponse(
            message="Coupon usage limit reached", 
            data=CouponValidateResponse(is_valid=False, discount_amount=0)
        )
        
    if coupon.min_order_value and req.cart_total < float(coupon.min_order_value):
        return ApiResponse(
            message=f"Minimum order value of ₹{coupon.min_order_value} required", 
            data=CouponValidateResponse(is_valid=False, discount_amount=0)
        )
        
    # Calculate discount
    discount_amount = 0.0
    if coupon.discount_type == DiscountType.fixed:
        discount_amount = float(coupon.discount_value)
    else:
        # Percentage
        discount_amount = req.cart_total * (float(coupon.discount_value) / 100)
        if coupon.max_discount:
            discount_amount = min(discount_amount, float(coupon.max_discount))
            
    # Discount cannot exceed cart total
    discount_amount = min(discount_amount, req.cart_total)
    
    return ApiResponse(
        message="Coupon applied successfully",
        data=CouponValidateResponse(
            is_valid=True,
            discount_amount=discount_amount,
            coupon=coupon
        )
    )
