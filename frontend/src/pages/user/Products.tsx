import { useState, useEffect } from "react"
import { toast } from "sonner"
import { productsApi } from "@/lib/api/products"
import type { ProductOut } from "@/types/product"
import { ProductCard } from "@/components/user/ProductCard"
import { Filter } from "lucide-react"
import { categoriesApi } from "@/lib/api/categories"
import type { CategoryOut } from "@/types/category"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { SearchInput } from "@/components/ui/search-input"
import PageLoading from "@/components/custom/PageLoading"

export function UserProducts() {
  const [products, setProducts] = useState<ProductOut[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{
    totalPages: number
    totalItems: number
  } | null>(null)
  const [categories, setCategories] = useState<CategoryOut[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const ITEMS_PER_PAGE = 10

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1) // Reset to page 1 on new search
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    categoriesApi
      .getCategories()
      .then((res) => {
        setCategories(res.data)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    let ignore = false

    const loadProducts = async () => {
      setIsLoading(true)
      try {
        const skip = (page - 1) * ITEMS_PER_PAGE
        const response = await productsApi.getProducts(
          skip,
          ITEMS_PER_PAGE,
          debouncedSearch,
          undefined,
          undefined,
          selectedCategory
        )
        if (!ignore) {
          // Only show active products to normal users
          const activeProducts = response.data.filter((p) => p.is_active)
          setProducts(activeProducts)
          setPagination({
            totalPages: response.pagination.totalPages,
            totalItems: response.pagination.totalItems,
          })
        }
      } catch (err) {
        if (!ignore) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load products"
          )
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      ignore = true
    }
  }, [page, debouncedSearch, selectedCategory])

  return (
    <div className="flex-1 space-y-3">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse available products and find what you need.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <SearchInput
            containerClassName="sm:w-64"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="gap-2 whitespace-nowrap" />
              }
            >
              <Filter className="h-4 w-4" />
              {selectedCategory
                ? (categories.find((c) => c.id === selectedCategory)?.name ??
                  "Category")
                : "All Categories"}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCategory(null)
                    setPage(1)
                  }}
                  className={
                    !selectedCategory ? "font-semibold text-primary" : ""
                  }
                >
                  All Categories
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {categories.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {categories.map((category) => (
                      <DropdownMenuItem
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id)
                          setPage(1)
                        }}
                        className={
                          selectedCategory === category.id
                            ? "font-semibold text-primary"
                            : ""
                        }
                      >
                        {category.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading && <PageLoading minHeight="min-h-135" />}

      {!isLoading && products.length === 0 && (
        <div className="flex min-h-100 flex-col items-center justify-center rounded-lg border border-dashed text-center">
          <h2 className="mb-2 text-xl font-semibold">No products found</h2>
          <p className="text-muted-foreground">
            Check back later for new arrivals.
          </p>
        </div>
      )}

      {!isLoading && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {(pagination?.totalPages ?? 1) > 1 && (
            <div className="flex w-full items-center justify-center">
              <p className="w-full text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(page - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {Math.min(page * ITEMS_PER_PAGE, pagination?.totalItems ?? 0)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {pagination?.totalItems ?? 0}
                </span>{" "}
                products
              </p>
              <Pagination>
                <PaginationContent className="flex w-full items-center justify-end">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (page > 1) setPage(page - 1)
                      }}
                      className={
                        page <= 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <div className="flex h-10 items-center px-4 text-sm font-medium">
                      Page {page} of {pagination?.totalPages ?? 1}
                    </div>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (page < (pagination?.totalPages ?? 1))
                          setPage(page + 1)
                      }}
                      className={
                        page >= (pagination?.totalPages ?? 1)
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  )
}
