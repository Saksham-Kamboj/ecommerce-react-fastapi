import { useState, useEffect } from "react"
import { MoreHorizontal, Plus, Pencil, Trash2, Eye, Filter } from "lucide-react"
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
import { categoriesApi } from "@/lib/api/categories"
import type { ProductOut, ProductCreate, ProductUpdate } from "@/types/product"
import type { CategoryOut } from "@/types/category"
import type { Pagination as PaginationType } from "@/types/api"
import { ProductFormDialog } from "@/components/admin/products/ProductFormDialog"
import { ProductDeleteDialog } from "@/components/admin/products/ProductDeleteDialog"
import { toast } from "sonner"
import { Link, useNavigate } from "react-router-dom"

export default function ProductsPage() {
  const navigate = useNavigate()
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

  // Sort state
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Category filter state
  const [categories, setCategories] = useState<CategoryOut[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  )

  // Load categories once
  useEffect(() => {
    categoriesApi
      .getCategories({ limit: 100 })
      .then((res) => setCategories(res.data))
      .catch(() => {})
  }, [])

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
        const res = await productsApi.getProducts(
          skip,
          limit,
          debouncedSearch,
          sortBy,
          sortOrder,
          selectedCategoryId
        )
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
  }, [
    page,
    limit,
    refreshTrigger,
    debouncedSearch,
    sortBy,
    sortOrder,
    selectedCategoryId,
  ])

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

  const handleFormSubmit = async (
    data: ProductCreate | ProductUpdate,
    imageFile?: File | null
  ) => {
    try {
      if (selectedProduct) {
        const res = await productsApi.updateProduct(
          selectedProduct.id,
          data,
          imageFile
        )
        toast.success(res.message)
      } else {
        const res = await productsApi.createProduct(
          data as ProductCreate,
          imageFile
        )
        toast.success(res.message)
      }

      setIsFormOpen(false)
      setIsLoading(true)
      setError(null)
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed")
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return
    try {
      const res = await productsApi.deleteProduct(selectedProduct.id)
      setIsDeleteOpen(false)
      setIsLoading(true)
      setError(null)
      setRefreshTrigger((prev) => prev + 1)
      toast.success(res.message)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete product"
      )
    }
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
    setPage(1) // Reset page on sort
  }

  const productColumns: ColumnDef<ProductOut>[] = [
    {
      header: "Product",
      className: "pl-6 min-w-[250px]",
      cell: (product) => (
        <div className="flex items-center gap-3">
          <Link
            to={`/products/${product.id}`}
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white shadow-xs"
          >
            <img
              src={
                product.image_url ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${product.name}&backgroundColor=f1f5f9,e2e8f0,cbd5e1&textColor=475569`
              }
              alt={product.name}
              className="h-full w-full object-contain p-1 mix-blend-multiply"
            />
          </Link>
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
      sortable: true,
      sortKey: "created_at",
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
      header: "Updated At",
      className: "hidden md:table-cell min-w-[140px]",
      sortable: true,
      sortKey: "updated_at",
      cell: (product) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {product.updated_at
              ? format(new Date(product.updated_at), "MMM d, yyyy")
              : "—"}
          </span>
          <span className="mt-0.5 text-xs text-muted-foreground">
            {product.updated_at
              ? format(new Date(product.updated_at), "hh:mm a")
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
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
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
    <div className="flex-1 space-y-3">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your inventory and product details.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <SearchInput
            containerClassName="sm:w-64"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Category filter */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="gap-2 whitespace-nowrap" />
              }
            >
              <Filter className="h-4 w-4" />
              {selectedCategoryId
                ? (categories.find((c) => c.id === selectedCategoryId)?.name ??
                  "Category")
                : "All Categories"}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCategoryId(null)
                    setPage(1)
                  }}
                  className={
                    !selectedCategoryId ? "font-semibold text-primary" : ""
                  }
                >
                  All Categories
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {categories.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {categories.map((cat) => (
                      <DropdownMenuItem
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategoryId(cat.id)
                          setPage(1)
                        }}
                        className={
                          selectedCategoryId === cat.id
                            ? "font-semibold text-primary"
                            : ""
                        }
                      >
                        {cat.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

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
        showIndex={true}
        sortColumn={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
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
