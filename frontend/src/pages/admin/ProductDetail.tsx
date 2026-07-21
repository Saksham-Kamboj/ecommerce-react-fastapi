import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { productsApi } from "@/lib/api/products"
import { reviewsApi } from "@/lib/api/reviews"
import type { ProductOut, ProductCreate, ProductUpdate } from "@/types/product"
import type { ReviewOut } from "@/types/review"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, Package, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProductReviews } from "@/components/user/ProductReviews"
import { StarRating } from "@/components/ui/star-rating"
import { useAuth } from "@/contexts/AuthContext"
import { ProductFormDialog } from "@/components/admin/products/ProductFormDialog"
import { ProductDeleteDialog } from "@/components/admin/products/ProductDeleteDialog"
import { toast } from "sonner"

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
  const { user } = useAuth()

  const [product, setProduct] = useState<ProductOut | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

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

  const handleFormSubmit = async (
    data: ProductCreate | ProductUpdate,
    imageFile?: File | null
  ) => {
    if (!product) return
    try {
      const res = await productsApi.updateProduct(product.id, data, imageFile)
      toast.success(res.message)
      setProduct(res.data)
      setIsFormOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed")
    }
  }

  const handleConfirmDelete = async () => {
    if (!product) return
    try {
      const res = await productsApi.deleteProduct(product.id)
      toast.success(res.message)
      setIsDeleteOpen(false)
      navigate("/products")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed")
    }
  }

  const [reviews, setReviews] = useState<ReviewOut[]>([])

  // Load reviews
  useEffect(() => {
    if (!productId) return
    let cancelled = false
    reviewsApi
      .getProductReviews(productId, 0, 100)
      .then((res) => {
        if (!cancelled) {
          setReviews(res.data)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load reviews"
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [productId])

  const [relatedProducts, setRelatedProducts] = useState<ProductOut[]>([])

  // Load related products
  useEffect(() => {
    if (!product?.category_id) return
    let cancelled = false
    productsApi
      .getProducts(0, 10, undefined, undefined, undefined, product.category_id)
      .then((res) => {
        if (!cancelled) {
          const others = res.data.filter((p) => p.id !== product.id)
          // Cryptographically safe shuffle, max 5
          const shuffled = [...others]
            .sort(
              () =>
                crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff - 0.5
            )
            .slice(0, 5)
          setRelatedProducts(shuffled)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to load related products"
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [product])

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex min-h-75 flex-col items-center justify-center gap-4 text-center">
        <p className="text-destructive">{error || "Product not found"}</p>
        <Button variant="outline" onClick={() => navigate("/products")}>
          Back to Products
        </Button>
      </div>
    )
  }

  const gradient = getGradient(product.name)
  const rating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0"
  const reviewsCount = reviews.length

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* ── Left: visual ── */}
        <div className="flex flex-col gap-4">
          {product.image_url ? (
            <div className="flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-2xl border bg-white p-4 shadow-lg">
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-contain mix-blend-multiply"
                loading="lazy"
              />
            </div>
          ) : (
            <div
              className={cn(
                "flex aspect-4/3 w-full items-center justify-center rounded-2xl bg-linear-to-br p-12 text-center text-white shadow-lg",
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
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-3xl font-bold tracking-tight">
                {product.name}
              </h2>
              {user?.role === "superadmin" && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      />
                    }
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => setIsFormOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> Update
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setIsDeleteOpen(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
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
              {/* Rating */}
              <div className="ml-2 flex items-center gap-3">
                <StarRating rating={Number(rating)} iconClassName="h-4 w-4" />
                <span className="text-sm font-semibold">{rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({reviewsCount} reviews)
                </span>
              </div>
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
                <span className="font-medium text-foreground">
                  {product.category.name}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-8 flex flex-col gap-6">
          <Separator />
          <h2 className="text-2xl font-bold tracking-tight">
            More from {product.category?.name || "this category"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {relatedProducts.map((rp) => (
              <Link
                to={`/products/${rp.id}`}
                key={rp.id}
                className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-white p-2">
                  {rp.image_url ? (
                    <img
                      src={rp.image_url}
                      alt={rp.name}
                      className="h-full w-full rounded-sm object-contain mix-blend-multiply"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-sm bg-muted p-6 text-muted-foreground">
                      <Package className="h-10 w-10 opacity-50" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <h3 className="line-clamp-2 leading-tight font-semibold tracking-tight group-hover:text-primary group-hover:underline">
                    {rp.name}
                  </h3>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg font-bold">
                      ₹{rp.price.toFixed(2)}
                    </span>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Package className="h-3.5 w-3.5" />
                      {rp.stock_quantity} in stock
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <Separator className="mb-8" />
        <ProductReviews
          productId={product.id}
          reviews={reviews}
          onReviewsChange={setReviews}
        />
      </div>

      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={product}
        onSubmit={handleFormSubmit}
      />

      <ProductDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        productName={product.name}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
