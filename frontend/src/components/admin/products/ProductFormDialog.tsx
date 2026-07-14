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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { ProductCreate, ProductUpdate, ProductOut } from "@/types/product"

const formSchema = z.object({
  name: z.string()
    .min(1, "Product name is required")
    .max(255)
    .regex(/^[a-zA-Z\s]*$/, "Product name must contain characters only"),
  description: z.string().optional().nullable(),
  price: z.number().min(0, "Price cannot be negative"),
  stock_quantity: z.number().int().min(0, "Stock cannot be negative"),
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
      const submitData = { ...values }
      
      // Convert empty strings to null for description
      if (submitData.description === "") {
        submitData.description = null
      }

      await onSubmit(submitData)
      form.reset()
    } catch {
      // Error handled by parent
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>{isEditing ? "Edit Product" : "Create Product"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Make changes to the product here. Click save when you're done."
              : "Add a new product to the catalog."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 pt-2"
        >
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

          <div className="flex justify-end gap-2 border-t pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
