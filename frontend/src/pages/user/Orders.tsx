import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useNavigate } from "react-router-dom"
import {
  PackageSearch,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  ChevronRight,
} from "lucide-react"

// ── Stats card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: Readonly<{
  icon: React.ElementType
  label: string
  value: string
  color: string
}>) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg leading-tight font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function UserOrders() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          My Orders
        </h1>
        <p className="text-muted-foreground">
          Track and manage your purchase history.
        </p>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value="0"
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value="0"
          color="bg-amber-500/10 text-amber-500"
        />
        <StatCard
          icon={Truck}
          label="Shipped"
          value="0"
          color="bg-purple-500/10 text-purple-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Delivered"
          value="0"
          color="bg-emerald-500/10 text-emerald-500"
        />
      </div>

      {/* Filters placeholder */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            "All",
            "Pending",
            "Confirmed",
            "Shipped",
            "Delivered",
            "Cancelled",
          ] as const
        ).map((f) => (
          <Button
            key={f}
            variant={f === "All" ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            disabled
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Empty state */}
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-5 rounded-xl border border-dashed text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <PackageSearch className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xl font-semibold">No orders yet</p>
          <p className="text-sm text-muted-foreground">
            Your order history will appear here once you make a purchase.
          </p>
        </div>
        <Button onClick={() => navigate("/products")}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Start Shopping
        </Button>
      </div>

      {/* Coming soon — order tracking card */}
      <Card className="border-dashed opacity-60">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4" />
            Order Tracking
            <Badge variant="secondary" className="ml-auto text-xs">
              Coming Soon
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 pb-5 sm:grid-cols-3">
          {(
            [
              "Order Placed",
              "Processing",
              "Shipped",
              "Out for Delivery",
              "Delivered",
            ] as const
          ).map((step, i) => (
            <div
              key={step}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-semibold">
                {i + 1}
              </div>
              <span>{step}</span>
              {i < 4 && <ChevronRight className="ml-auto h-3 w-3 opacity-40" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
