import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ImageLensProps {
  isVisible: boolean
}

export const ImageLens = forwardRef<HTMLDivElement, ImageLensProps>(
  ({ isVisible }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-none absolute top-0 left-0 z-10 hidden border border-primary bg-white/30 shadow-sm backdrop-blur-[1px]",
          isVisible && "block"
        )}
        style={{
          willChange: "transform",
        }}
      />
    )
  }
)

ImageLens.displayName = "ImageLens"
