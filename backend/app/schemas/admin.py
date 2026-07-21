from datetime import date, datetime
import uuid
from pydantic import BaseModel

class DailyRevenue(BaseModel):
    date: date | str
    revenue: float
    orders: int

class RecentOrderBrief(BaseModel):
    id: uuid.UUID
    created_at: datetime
    total_amount: float
    status: str
    user_name: str

class AdminStatsOut(BaseModel):
    total_users: int
    total_products: int
    total_categories: int
    total_orders: int
    total_revenue: float
    recent_orders: list[RecentOrderBrief]
    revenue_chart: list[DailyRevenue]
