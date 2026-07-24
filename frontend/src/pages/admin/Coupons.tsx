import { useState, useEffect, useCallback, useMemo } from "react"
import { couponsApi } from "@/lib/api/coupons"
import type { Pagination as PaginationType } from "@/types/api"
import type { CouponOut, CouponCreate } from "@/types/coupon"

import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react"
import { CouponFormDialog } from "@/components/admin/coupons/CouponFormDialog"
import { ErrorMessage } from "@/components/ui/error-message"
import PageLoading from "@/components/custom/PageLoading"

interface CouponColumnsProps {
  onEdit: (coupon: CouponOut) => void
  onDelete: (coupon: CouponOut) => void
}

function getCouponColumns({
  onEdit,
  onDelete,
}: CouponColumnsProps): ColumnDef<CouponOut>[] {
  return [
    {
      header: "Code",
      className: "pl-6 min-w-[120px]",
      cell: (coupon) => (
        <span className="font-mono font-medium">{coupon.code}</span>
      ),
    },
    {
      header: "Discount",
      className: "w-[150px]",
      cell: (coupon) => (
        <span>
          {coupon.discount_type === "percentage"
            ? `${coupon.discount_value}%`
            : `₹${coupon.discount_value}`}
          {coupon.discount_type === "percentage" &&
            coupon.max_discount &&
            ` (Max ₹${coupon.max_discount})`}
        </span>
      ),
    },
    {
      header: "Min Order",
      className: "w-[120px]",
      cell: (coupon) => (
        <span>
          {coupon.min_order_value ? `₹${coupon.min_order_value}` : "-"}
        </span>
      ),
    },
    {
      header: "Usage",
      className: "w-[100px]",
      cell: (coupon) => (
        <span>
          {coupon.usage_count} / {coupon.usage_limit || "∞"}
        </span>
      ),
    },
    {
      header: "Status",
      className: "w-[120px]",
      cell: (coupon) => (
        <Badge
          variant={coupon.is_active ? "outline" : "secondary"}
          className={
            coupon.is_active
              ? "border-emerald-500 text-emerald-600"
              : "text-muted-foreground"
          }
        >
          {coupon.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "w-[100px] pr-6 text-right",
      cell: (coupon) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(coupon)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                />
              }
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(coupon.id)}
                >
                  Copy coupon ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(coupon.code)}
                >
                  Copy code
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(coupon)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]
}

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponOut[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [page, setPage] = useState(1)
  const limit = 10
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<CouponOut | null>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    let ignore = false
    const fetchCoupons = async () => {
      setIsLoading(true)
      try {
        const skip = (page - 1) * limit
        const res = await couponsApi.getCoupons({
          skip,
          limit,
          search: debouncedSearch,
        })
        if (!ignore) {
          setCoupons(res.data)
          setPagination(res.pagination)
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch coupons"
          )
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    fetchCoupons()

    return () => {
      ignore = true
    }
  }, [page, limit, refreshTrigger, debouncedSearch])

  const handleCreateNew = () => {
    setSelectedCoupon(null)
    setIsFormOpen(true)
  }

  const handleEditCoupon = useCallback((coupon: CouponOut) => {
    setSelectedCoupon(coupon)
    setIsFormOpen(true)
  }, [])

  const handleDeleteClick = useCallback((coupon: CouponOut) => {
    setSelectedCoupon(coupon)
    setIsDeleteOpen(true)
  }, [])

  const handleConfirmDelete = async () => {
    if (!selectedCoupon) return
    try {
      const res = await couponsApi.deleteCoupon(selectedCoupon.id)
      setIsDeleteOpen(false)
      setIsLoading(true)
      setError(null)
      setRefreshTrigger((prev) => prev + 1)
      toast.success(res.message)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete coupon"
      )
    }
  }

  const handlePageChange = (newPage: number) => {
    setIsLoading(true)
    setError(null)
    setPage(newPage)
  }

  const couponColumns = useMemo(
    () =>
      getCouponColumns({
        onEdit: handleEditCoupon,
        onDelete: handleDeleteClick,
      }),
    [handleEditCoupon, handleDeleteClick]
  )

  const handleFormSubmit = async (data: CouponCreate) => {
    try {
      if (selectedCoupon) {
        const res = await couponsApi.updateCoupon(selectedCoupon.id, data)
        toast.success(res.message)
      } else {
        const res = await couponsApi.createCoupon(data)
        toast.success(res.message)
      }
      setIsFormOpen(false)
      setIsLoading(true)
      setError(null)
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save coupon")
    }
  }

  if (isLoading && coupons.length === 0) {
    return <PageLoading minHeight="min-h-135" />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="flex-1 space-y-3">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Coupons</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage discount codes and promotions.
          </p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <SearchInput
            containerClassName="sm:w-64"
            placeholder="Search coupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            onClick={handleCreateNew}
            className="cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Coupon
          </Button>
        </div>
      </div>

      <DataTable
        data={coupons}
        columns={couponColumns}
        isLoading={isLoading}
        error={error}
        emptyMessage="No coupons found."
        showIndex={true}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      <CouponFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        coupon={selectedCoupon}
        onSubmit={handleFormSubmit}
      />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the coupon "{selectedCoupon?.code}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
