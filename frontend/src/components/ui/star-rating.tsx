import { Star, StarHalf } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  iconClassName?: string
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  iconClassName,
  className,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => {
        if (star <= rating) {
          return (
            <Star
              key={star}
              className={cn("fill-amber-400 text-amber-400", iconClassName)}
            />
          )
        } else if (star - 0.5 <= rating) {
          return (
            <div key={star} className="relative inline-flex">
              <Star
                className={cn(
                  "fill-transparent text-muted-foreground/40",
                  iconClassName
                )}
              />
              <StarHalf
                className={cn(
                  "absolute top-0 left-0 fill-amber-400 text-amber-400",
                  iconClassName
                )}
              />
            </div>
          )
        } else {
          return (
            <Star
              key={star}
              className={cn(
                "fill-transparent text-muted-foreground/40",
                iconClassName
              )}
            />
          )
        }
      })}
    </div>
  )
}
