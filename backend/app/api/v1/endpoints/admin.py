from typing import Any
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_active_admin
from app.models.user import User
from app.models.product import Product
from app.models.category import Category
from app.models.order import Order, OrderStatus
from app.schemas.response import ApiResponse
from app.schemas.admin import AdminStatsOut, DailyRevenue, RecentOrderBrief

router = APIRouter()

@router.get("/stats", response_model=ApiResponse[AdminStatsOut])
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
) -> Any:
    # 1. Counts
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_categories = db.query(func.count(Category.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    
    # 2. Revenue (only delivered orders)
    total_revenue = db.query(func.sum(Order.total_amount))\
        .filter(Order.status == OrderStatus.delivered).scalar() or 0.0

    # 3. Recent Orders
    recent_db_orders = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    recent_orders = []
    for o in recent_db_orders:
        recent_orders.append(RecentOrderBrief(
            id=o.id,
            created_at=o.created_at,
            total_amount=float(o.total_amount),
            status=o.status,
            user_email=o.user.email if o.user else "Unknown"
        ))

    # 4. Chart Data (last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    
    # Fetch only delivered orders in last 30 days for revenue chart
    recent_delivered_orders = db.query(Order)\
        .filter(Order.created_at >= thirty_days_ago)\
        .filter(Order.status == OrderStatus.delivered).all()
    
    daily_map = {}
    for o in recent_delivered_orders:
        # Some DBs return naive datetimes, some aware. Handle gracefully.
        if o.created_at.tzinfo is None:
            o.created_at = o.created_at.replace(tzinfo=timezone.utc)
        date_str = o.created_at.astimezone(timezone.utc).strftime("%b %d")
        
        if date_str not in daily_map:
            daily_map[date_str] = {"revenue": 0.0, "orders": 0}
        daily_map[date_str]["revenue"] += float(o.total_amount)
        daily_map[date_str]["orders"] += 1
        
    revenue_chart = []
    # To keep chronological order, we must sort by actual date, not string
    # Easiest way is to iterate over the last 30 days and fill in gaps
    for i in range(29, -1, -1):
        target_date = datetime.now(timezone.utc) - timedelta(days=i)
        date_str = target_date.strftime("%b %d")
        if date_str in daily_map:
            revenue_chart.append(DailyRevenue(
                date=date_str,
                revenue=daily_map[date_str]["revenue"],
                orders=daily_map[date_str]["orders"]
            ))
        else:
            revenue_chart.append(DailyRevenue(
                date=date_str,
                revenue=0.0,
                orders=0
            ))
            
    stats = AdminStatsOut(
        total_users=total_users,
        total_products=total_products,
        total_categories=total_categories,
        total_orders=total_orders,
        total_revenue=float(total_revenue),
        recent_orders=recent_orders,
        revenue_chart=revenue_chart
    )
    
    return ApiResponse(message="Stats retrieved successfully", data=stats)
