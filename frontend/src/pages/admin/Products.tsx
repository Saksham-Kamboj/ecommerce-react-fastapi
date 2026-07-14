import { useState, useEffect } from "react"
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"

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
import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { productsApi } from "@/lib/api/products"
import type { ProductOut, ProductCreate, ProductUpdate } from "@/types/product"
import type { Pagination as PaginationType } from "@/types/api"
import { ProductFormDialog } from "@/components/admin/products/ProductFormDialog"
import { ProductDeleteDialog } from "@/components/admin/products/ProductDeleteDialog"

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductOut[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination & Search state
  const [page, setPage] = useState(1)
  const limit = 10
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductOut | null>(
    null
  )

  useEffect(() => {
    let ignore = false
    const loadProducts = async () => {
      setIsLoading(true)
      try {
        const skip = (page - 1) * limit
        const res = await productsApi.getProducts(skip, limit, debouncedSearch)
        if (!ignore) {
          setProducts(res.data)
          setPagination(res.pagination)
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch products"
          )
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    loadProducts()
    return () => {
      ignore = true
    }
  }, [page, limit, refreshTrigger, debouncedSearch])

  const handleCreateProduct = () => {
    setSelectedProduct(null)
    setIsFormOpen(true)
  }

  const handleEditProduct = (product: ProductOut) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (product: ProductOut) => {
    setSelectedProduct(product)
    setIsDeleteOpen(true)
  }

  const handleFormSubmit = async (data: ProductCreate | ProductUpdate) => {
    if (selectedProduct) {
      await productsApi.updateProduct(selectedProduct.id, data)
    } else {
      await productsApi.createProduct(data as ProductCreate)
    }
    setIsFormOpen(false)
    setIsLoading(true)
    setError(null)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return
    try {
      await productsApi.deleteProduct(selectedProduct.id)
      setIsDeleteOpen(false)
      setIsLoading(true)
      setError(null)
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      alert(
        "Failed to delete product: " +
          (err instanceof Error ? err.message : "Unknown error")
      )
    }
  }

  const productColumns: ColumnDef<ProductOut>[] = [
    {
      header: "Product",
      className: "pl-6 min-w-[250px]",
      cell: (product) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted/50 shadow-xs">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${product.name}&backgroundColor=f1f5f9,e2e8f0,cbd5e1&textColor=475569`}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex max-w-[300px] flex-col">
            <span className="truncate leading-tight font-semibold text-foreground">
              {product.name}
            </span>
            <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {product.description || "No description provided."}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Price",
      className: "w-[120px]",
      cell: (product) => (
        <span className="font-medium text-foreground">
          ₹{product.price.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Stock",
      className: "w-[100px]",
      cell: (product) => (
        <span className="font-medium text-foreground">
          {product.stock_quantity}
        </span>
      ),
    },
    {
      header: "Status",
      className: "w-[120px]",
      cell: (product) =>
        product.is_active ? (
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400"
          >
            Active
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400"
          >
            Inactive
          </Badge>
        ),
    },
    {
      header: "Created At",
      className: "hidden md:table-cell min-w-[140px]",
      cell: (product) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {product.created_at
              ? format(new Date(product.created_at), "MMM d, yyyy")
              : "—"}
          </span>
          <span className="mt-0.5 text-xs text-muted-foreground">
            {product.created_at
              ? format(new Date(product.created_at), "hh:mm a")
              : "—"}
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "w-[100px] pr-6 text-right",
      cell: (product) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => handleEditProduct(product)}
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
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(product.id)}
                >
                  Copy product ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(product)}
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

  const handlePageChange = (newPage: number) => {
    setIsLoading(true)
    setError(null)
    setPage(newPage)
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your inventory and product details.
          </p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <SearchInput
            containerClassName="sm:w-64"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            onClick={handleCreateProduct}
            className="cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <DataTable
        data={products}
        columns={productColumns}
        isLoading={isLoading}
        error={error}
        emptyMessage="No products found."
        pagination={pagination}
        onPageChange={handlePageChange}
        showIndex={false} // Match screenshot, no index shown
      />

      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={selectedProduct}
        onSubmit={handleFormSubmit}
      />

      <ProductDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        productName={selectedProduct?.name || "this product"}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
