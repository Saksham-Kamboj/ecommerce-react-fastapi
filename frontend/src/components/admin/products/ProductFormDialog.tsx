import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { ProductCreate, ProductUpdate, ProductOut } from "@/types/product"

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(255)
    .regex(/^[a-zA-Z\s]*$/, "Product name must contain characters only"),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable(),
  price: z
    .number()
    .min(0, "Price cannot be negative")
    .max(1000000, "Price is too high"),
  stock_quantity: z
    .number()
    .int()
    .min(0, "Stock cannot be negative")
    .max(100000, "Stock is too high"),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: ProductOut | null
  onSubmit: (data: ProductCreate | ProductUpdate) => Promise<void>
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
}: ProductFormDialogProps) {
  const isEditing = !!product

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock_quantity: 0,
      is_active: true,
    },
  })

  useEffect(() => {
    if (open && product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        price: product.price,
        stock_quantity: product.stock_quantity,
        is_active: product.is_active,
      })
    } else if (open && !product) {
      form.reset({
        name: "",
        description: "",
        price: 0,
        stock_quantity: 0,
        is_active: true,
      })
    }
  }, [open, product, form])

  const handleSubmit = async (values: FormValues) => {
    try {
      form.clearErrors("root")
      const submitData = { ...values }

      // Convert empty strings to null for description
      if (submitData.description === "") {
        submitData.description = null
      }

      await onSubmit(submitData)
      form.reset()
    } catch (err) {
      form.setError("root", {
        type: "manual",
        message: err instanceof Error ? err.message : "Failed to save product",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-[425px]">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-base">
            {isEditing ? "Edit Product" : "Create Product"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Make changes to the product here. Click save when you're done."
              : "Add a new product to the catalog."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="product-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 p-4"
        >
          {form.formState.errors.root && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive">
              {form.formState.errors.root.message}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              placeholder="e.g. Advanced Calculus"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Comprehensive study material..."
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock</Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                step="1"
                {...form.register("stock_quantity", { valueAsNumber: true })}
              />
              {form.formState.errors.stock_quantity && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.stock_quantity.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
            <Controller
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <Checkbox
                  id="is_active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="is_active">Active Product</Label>
              <p className="text-sm text-muted-foreground">
                Make this product visible in the store.
              </p>
            </div>
          </div>
        </form>
        <DialogFooter className="border-t bg-muted/20 p-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="product-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
