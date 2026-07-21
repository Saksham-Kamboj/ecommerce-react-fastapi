import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { reviewsApi } from "@/lib/api/reviews"
import type { ReviewOut, ReviewCreate } from "@/types/review"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Star, Loader2, User as UserIcon, Trash2, Pencil } from "lucide-react"
import { StarRating } from "@/components/ui/star-rating"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

interface ProductReviewsProps {
  productId: string
  reviews: ReviewOut[]
  onReviewsChange: (reviews: ReviewOut[]) => void
}

export function ProductReviews({
  productId,
  reviews,
  onReviewsChange,
}: ProductReviewsProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const userReview = reviews.find((r) => r.user_id === user?.id)
  const isAdmin = user?.role === "superadmin"

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please login to submit a review")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: ReviewCreate = { rating, comment: comment.trim() || null }
      if (userReview && isEditing) {
        const res = await reviewsApi.updateReview(userReview.id, payload)
        toast.success(res.message)
        onReviewsChange(
          reviews.map((r) => (r.id === userReview.id ? res.data : r))
        )
        setIsEditing(false)
      } else {
        const res = await reviewsApi.createReview(productId, payload)
        toast.success(res.message)
        onReviewsChange([res.data, ...reviews])
      }
      setIsReviewModalOpen(false) // Close modal on success
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit review"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (reviewId: string) => {
    setIsDeleting(reviewId)
    try {
      await reviewsApi.deleteReview(reviewId)
      toast.success("Review deleted successfully")
      onReviewsChange(reviews.filter((r) => r.id !== reviewId))
      if (userReview?.id === reviewId) {
        setRating(5)
        setComment("")
        setIsEditing(false)
        setIsReviewModalOpen(false)
      }
    } catch {
      toast.error("Failed to delete review")
    } finally {
      setIsDeleting(null)
      setReviewToDelete(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
        {!isAdmin &&
          reviews.length > 0 &&
          (user ? (
            !userReview && (
              <Button
                onClick={() => {
                  setIsEditing(false)
                  setRating(5)
                  setComment("")
                  setIsReviewModalOpen(true)
                }}
              >
                Write a Review
              </Button>
            )
          ) : (
            <Button variant="outline" onClick={() => navigate("/login")}>
              Login to Review
            </Button>
          ))}
      </div>

      <div className="flex flex-col gap-4">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
            <Star className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <h3 className="text-xl font-medium text-foreground">
              No reviews yet
            </h3>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Be the first to review this product!
            </p>
            {!isAdmin &&
              (user ? (
                <Button
                  onClick={() => {
                    setIsEditing(false)
                    setRating(5)
                    setComment("")
                    setIsReviewModalOpen(true)
                  }}
                >
                  Write a Review
                </Button>
              ) : (
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Login to Review
                </Button>
              ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex flex-col gap-2 border-b pb-4 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-semibold">
                      {review.user?.full_name || "Anonymous User"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="mr-2 text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    {review.user_id === user?.id && !isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={() => {
                          setIsEditing(true)
                          setRating(review.rating)
                          setComment(review.comment || "")
                          setIsReviewModalOpen(true)
                        }}
                        title="Edit Review"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    )}
                    {(isAdmin || review.user_id === user?.id) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setReviewToDelete(review.id)}
                        disabled={isDeleting === review.id}
                        title="Delete Review"
                      >
                        {isDeleting === review.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <StarRating
                  rating={review.rating}
                  iconClassName="h-3.5 w-3.5"
                />

                {review.comment && (
                  <blockquote className="relative mt-1 rounded-r-md border-l-4 border-amber-400 bg-muted/30 py-2 pr-3 pl-4 text-sm whitespace-pre-wrap text-foreground italic">
                    <span className="mr-1 font-serif text-lg text-amber-400">
                      “
                    </span>
                    {review.comment}
                    <span className="ml-1 font-serif text-lg text-amber-400">
                      ”
                    </span>
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal Form */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Review" : "Write a Review"}
            </DialogTitle>
            <DialogDescription>
              Share your experience with this product.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="cursor-pointer focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        star <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-transparent text-muted-foreground/40"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Comment (Optional)</label>
              <textarea
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                placeholder="What did you like or dislike?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <DialogFooter className="mt-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Update Review" : "Submit Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!reviewToDelete}
        onOpenChange={(open) => !open && setReviewToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewToDelete(null)}
              disabled={!!isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => reviewToDelete && handleDelete(reviewToDelete)}
              disabled={!!isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
