import { useState, useEffect } from "react"
import { productsApi } from "@/lib/api/products"
import type { ProductOut } from "@/types/product"
import { ProductCard } from "@/components/user/ProductCard"
import { Loader2 } from "lucide-react"

export function UserProducts() {
  const [products, setProducts] = useState<ProductOut[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    const loadProducts = async () => {
      try {
        // Fetch products, maybe increase limit to show a good grid
        const response = await productsApi.getProducts(1, 20)
        if (!ignore) {
          // Only show active products to normal users
          const activeProducts = response.data.filter((p) => p.is_active)
          setProducts(activeProducts)
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
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          All Products
        </h1>
        <p className="text-muted-foreground">
          Browse our collection of high-quality study materials and guides.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          <p className="font-medium">Error loading products</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !error && products.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed text-center">
          <h2 className="mb-2 text-xl font-semibold">No products found</h2>
          <p className="text-muted-foreground">
            Check back later for new arrivals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
