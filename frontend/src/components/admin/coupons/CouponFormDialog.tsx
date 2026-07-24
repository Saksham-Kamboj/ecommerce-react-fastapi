import { useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, Loader2, Wand2 } from "lucide-react"
import type { CouponCreate, CouponOut } from "@/types/coupon"

interface CouponFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon?: CouponOut | null
  onSubmit: (data: CouponCreate) => Promise<void>
}

export function CouponFormDialog({
  open,
  onOpenChange,
  coupon,
  onSubmit,
}: CouponFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CouponCreate>({
    defaultValues: {
      code: "",
      discount_type: "percentage",
      discount_value: 10,
      min_order_value: null,
      max_discount: null,
      is_active: true,
      usage_limit: null,
    },
  })

  useEffect(() => {
    if (open) {
      if (coupon) {
        reset({
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          min_order_value: coupon.min_order_value,
          max_discount: coupon.max_discount,
          is_active: coupon.is_active,
          usage_limit: coupon.usage_limit,
        })
      } else {
        reset({
          code: "",
          discount_type: "percentage",
          discount_value: 10,
          min_order_value: null,
          max_discount: null,
          is_active: true,
          usage_limit: null,
        })
      }
    }
  }, [open, coupon, reset])

  const handleFormSubmit = async (data: CouponCreate) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = "SAVE-"
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setValue("code", result, { shouldValidate: true })
  }

  const discountType = useWatch({
    control,
    name: "discount_type",
  })

  const isActive = useWatch({
    control,
    name: "is_active",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {coupon ? "Edit Coupon" : "Create New Coupon"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code *</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                placeholder="e.g. SUMMER20"
                {...register("code", { required: "Code is required" })}
              />
              {!coupon && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomCode}
                  title="Auto Generate"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal"
                    />
                  }
                >
                  {discountType === "percentage"
                    ? "Percentage (%)"
                    : discountType === "fixed"
                      ? "Fixed Amount (₹)"
                      : "Select type"}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-(--anchor-width)"
                >
                  <DropdownMenuItem
                    onClick={() => setValue("discount_type", "percentage")}
                  >
                    Percentage (%)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setValue("discount_type", "fixed")}
                  >
                    Fixed Amount (₹)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_value">Discount Value *</Label>
              <Input
                id="discount_value"
                type="number"
                step="1"
                min="0"
                {...register("discount_value", {
                  required: "Value is required",
                  min: { value: 0, message: "Must be positive" },
                  valueAsNumber: true,
                })}
              />
              {errors.discount_value && (
                <p className="text-sm text-destructive">
                  {errors.discount_value.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_order_value">Min Order Value (₹)</Label>
              <Input
                id="min_order_value"
                type="number"
                step="1"
                min="0"
                placeholder="Optional"
                {...register("min_order_value", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_discount">
                Max Discount (₹) {discountType === "fixed" && "(N/A)"}
              </Label>
              <Input
                id="max_discount"
                type="number"
                step="1"
                min="0"
                disabled={discountType === "fixed"}
                placeholder="Optional"
                {...register("max_discount", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="usage_limit">Total Usage Limit</Label>
            <Input
              id="usage_limit"
              type="number"
              min="1"
              placeholder="Leave empty for unlimited"
              {...register("usage_limit", { valueAsNumber: true })}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(val) => setValue("is_active", val as boolean)}
            />
            <Label htmlFor="is_active">Active (Can be used by customers)</Label>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {coupon ? "Update Coupon" : "Create Coupon"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
