import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { productsApi } from "@/lib/api/products"
import type { ProductOut } from "@/types/product"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Package } from "lucide-react"
import { cn } from "@/lib/utils"

const GRADIENT_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-400 to-teal-600",
  "from-orange-400 to-rose-500",
  "from-purple-500 to-fuchsia-600",
  "from-cyan-500 to-blue-600",
]

function getGradient(name: string): string {
  const sum = name
    .split("")
    .reduce((acc, char) => acc + (char.codePointAt(0) ?? 0), 0)
  return GRADIENT_COLORS[sum % GRADIENT_COLORS.length]
}

export function AdminProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const [product, setProduct] = useState<ProductOut | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Load product
  useEffect(() => {
    if (!productId) return
    let cancelled = false
    productsApi
      .getProduct(productId)
      .then((res) => {
        if (!cancelled) {
          setProduct(res.data)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Product not found")
          setIsLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [productId])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
        <p className="text-destructive">{error || "Product not found"}</p>
        <Button variant="outline" onClick={() => navigate("/products")}>
          Back to Products
        </Button>
      </div>
    )
  }

  const gradient = getGradient(product.name)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* ── Left: visual ── */}
        <div className="flex flex-col gap-4">
          {product.image_url ? (
            <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border bg-white p-4 shadow-lg">
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-contain mix-blend-multiply"
              />
            </div>
          ) : (
            <div
              className={cn(
                "flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-linear-to-br p-12 text-center text-white shadow-lg",
                gradient
              )}
            >
              <span className="font-serif text-3xl font-bold tracking-tight drop-shadow-lg">
                {product.name}
              </span>
            </div>
          )}
        </div>

        {/* ── Right: info ── */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight">
              {product.name}
            </h2>
            <div className="flex items-center gap-2">
              <Badge
                variant={product.is_active ? "outline" : "secondary"}
                className={
                  product.is_active
                    ? "border-emerald-400 text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                }
              >
                {product.is_active ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />
                {product.stock_quantity} in stock
              </Badge>
            </div>
          </div>

          <div className="text-4xl font-bold text-primary">
            ₹{product.price.toFixed(2)}
          </div>

          <Separator />

          {product.description && (
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold">Description</h3>
              <p className="leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}

          <Separator />

          {product.category && (
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>
                <strong>Category:</strong>{" "}
                <span className="font-medium text-foreground">{product.category.name}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
