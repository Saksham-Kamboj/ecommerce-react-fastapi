import { useState, useEffect } from "react"
import { productsApi } from "@/lib/api/products"
import type { ProductOut } from "@/types/product"
import { ProductCard } from "@/components/user/ProductCard"
import { Loader2 } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { SearchInput } from "@/components/ui/search-input"

export function UserProducts() {
  const [products, setProducts] = useState<ProductOut[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
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
    let ignore = false

    const loadProducts = async () => {
      setIsLoading(true)
      try {
        const skip = (page - 1) * ITEMS_PER_PAGE
        const response = await productsApi.getProducts(
          skip,
          ITEMS_PER_PAGE,
          debouncedSearch
        )
        if (!ignore) {
          // Only show active products to normal users
          const activeProducts = response.data.filter((p) => p.is_active)
          setProducts(activeProducts)
          setTotalPages(response.pagination.totalPages || 1)
          setTotalItems(response.pagination.totalItems || 0)
        }
      } catch (err) {
        if (!ignore) {
          setError(
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
  }, [page, debouncedSearch])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 pr-2 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            All Products
          </h1>
          <p className="text-muted-foreground">
            Browse our collection of available products.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <SearchInput
            containerClassName="sm:w-64"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          <p className="font-medium">Error loading products</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && !error && products.length === 0 && (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed text-center">
          <h2 className="mb-2 text-xl font-semibold">No products found</h2>
          <p className="text-muted-foreground">
            Check back later for new arrivals.
          </p>
        </div>
      )}

      {!isLoading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex w-full items-center justify-center">
              <p className="w-full text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(page - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {Math.min(page * ITEMS_PER_PAGE, totalItems)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {totalItems}
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
                      Page {page} of {totalPages}
                    </div>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (page < totalPages) setPage(page + 1)
                      }}
                      className={
                        page >= totalPages
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
