import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { adminApi } from "@/lib/api/admin"
import type { AdminStatsOut } from "@/types/admin"
import {
  Users,
  ShoppingBag,
  ShoppingCart,
  IndianRupee,
  Layers,
} from "lucide-react"
import { format } from "date-fns"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

export function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<AdminStatsOut | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await adminApi.getStats()
        setStats(response.data)
      } catch (err) {
        console.error("Failed to fetch admin stats:", err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center text-destructive">
        Failed to load dashboard metrics.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-primary">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome, {user?.full_name || user?.email}! Here is the latest overview
          of your store.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.total_revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          icon={<IndianRupee className="h-4 w-4" />}
          onClick={() => navigate("/sales")}
        />

        <StatCard
          title="Total Orders"
          value={stats.total_orders.toLocaleString()}
          icon={<ShoppingCart className="h-4 w-4" />}
          onClick={() => navigate("/orders")}
        />

        <StatCard
          title="Total Products"
          value={stats.total_products.toLocaleString()}
          icon={<ShoppingBag className="h-4 w-4" />}
          onClick={() => navigate("/products")}
        />

        <StatCard
          title="Total Users"
          value={stats.total_users.toLocaleString()}
          icon={<Users className="h-4 w-4" />}
          onClick={() => navigate("/users")}
        />

        <StatCard
          title="Total Categories"
          value={stats.total_categories.toLocaleString()}
          icon={<Layers className="h-4 w-4" />}
          onClick={() => navigate("/categories")}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders Table */}
        <Card className="col-span-1">
          <CardHeader className="border-b">
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              The 5 most recent orders placed in your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recent_orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <TableCell className="font-mono text-xs">
                        {order.id.split("-")[0]}
                      </TableCell>
                      <TableCell>{order.user_name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{order.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            order.status === "delivered"
                              ? "border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : order.status === "cancelled"
                                ? "border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : order.status === "shipped"
                                  ? "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {stats.recent_orders.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No recent orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="col-span-1 flex flex-col pb-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-0">
            <div>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>
                Daily revenue over the last 30 days.
              </CardDescription>
            </div>
            <IndianRupee className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={chartConfig} className="h-55 w-full">
              <BarChart accessibilityLayer data={stats.revenue_chart}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  fontSize={12}
                  minTickGap={32}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      valueFormatter={(value) =>
                        `₹${Number(value).toLocaleString("en-IN")}`
                      }
                    />
                  }
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: React.ReactNode
  icon: React.ReactNode
  onClick?: () => void
}

function StatCard({ title, value, icon, onClick }: StatCardProps) {
  return (
    <Card className={onClick ? "cursor-pointer" : ""} onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <Skeleton className="h-4 w-24" />
        <div className="rounded-full bg-muted p-3">
          <Skeleton className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-20" />
      </CardContent>
    </Card>
  )
}

// Static heights for skeleton chart bars (in pixels)
const SKELETON_BAR_HEIGHTS = [35, 55, 40, 70, 45, 60, 30, 50, 65, 25, 45, 55]

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="mb-2 h-9 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Recent Orders and Chart Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders Table Skeleton */}
        <Card className="col-span-1">
          <CardHeader className="border-b">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-1 h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart Skeleton */}
        <Card className="col-span-1 flex flex-col pb-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-0">
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-1 h-4 w-64" />
            </div>
            <Skeleton className="h-5 w-5" />
          </CardHeader>
          <CardContent className="flex-1 pt-4 pb-0">
            <div className="h-55 w-full">
              <div className="mb-4 flex items-center justify-between">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-8" />
                ))}
              </div>
              <div className="relative flex h-40 items-end justify-between">
                {SKELETON_BAR_HEIGHTS.map((height, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <Skeleton className="mb-1 h-4 w-8" />
                    <Skeleton
                      className="w-6"
                      style={{ height: `${height}px` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
