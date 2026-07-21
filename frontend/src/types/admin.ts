export interface DailyRevenue {
  date: string
  revenue: number
  orders: number
}

export interface RecentOrderBrief {
  id: string
  created_at: string
  total_amount: number
  status: string
  user_name: string
}

export interface AdminStatsOut {
  total_users: number
  total_products: number
  total_categories: number
  total_orders: number
  total_revenue: number
  recent_orders: RecentOrderBrief[]
  revenue_chart: DailyRevenue[]
}
