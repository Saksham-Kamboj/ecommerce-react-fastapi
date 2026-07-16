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
import { Star, Loader2, User as UserIcon, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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

  const userReview = reviews.find((r) => r.user_id === user?.id)
  const isAdmin = user?.role === "superadmin"

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
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
      <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>

      <div
        className={cn(
          "grid grid-cols-1 gap-8",
          isAdmin ? "md:grid-cols-1" : "md:grid-cols-3"
        )}
      >
        {/* Review Form */}
        {!isAdmin && (
          <div className="flex flex-col gap-4 md:col-span-1">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">
                {isEditing ? "Edit Your Review" : "Write a Review"}
              </h3>
              {user ? (
                userReview && !isEditing ? (
                  <div className="flex flex-col gap-3 rounded-md bg-muted p-4 text-sm">
                    <p className="text-muted-foreground">
                      You have already reviewed this product. Thank you!
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(true)
                        setRating(userReview?.rating || 5)
                        setComment(userReview?.comment || "")
                      }}
                    >
                      Edit Review
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                                "h-6 w-6 transition-colors",
                                star <= rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-muted text-muted"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium">
                        Comment (Optional)
                      </label>
                      <textarea
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        placeholder="What did you like or dislike?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </div>

                    <div className="mt-2 flex gap-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isEditing ? "Update Review" : "Submit Review"}
                      </Button>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false)
                            setRating(userReview?.rating || 5)
                            setComment(userReview?.comment || "")
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                )
              ) : (
                <div className="text-sm text-muted-foreground">
                  Please{" "}
                  <a href="/login" className="text-primary hover:underline">
                    login
                  </a>{" "}
                  to leave a review.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Review List */}
        <div className={cn("flex flex-col gap-4", !isAdmin && "md:col-span-2")}>
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <Star className="mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-lg font-medium text-foreground">
                No reviews yet
              </p>
              <p className="text-sm text-muted-foreground">
                Be the first to review this product!
              </p>
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
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

                  <div className="mt-1 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-3.5 w-3.5",
                          star <= review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                        )}
                      />
                    ))}
                  </div>

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
      </div>

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
