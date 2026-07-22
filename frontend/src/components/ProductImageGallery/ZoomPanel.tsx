import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ZoomPanelProps {
  isVisible: boolean
  imageUrl: string
}

export const ZoomPanel = forwardRef<HTMLDivElement, ZoomPanelProps>(
  ({ isVisible, imageUrl }, ref) => {
    return (
      <div
        className={cn(
          "absolute top-0 left-[calc(100%+1rem)] z-50 hidden h-[500px] w-[500px] overflow-hidden rounded-2xl border bg-white opacity-0 shadow-xl transition-opacity duration-200 lg:block",
          isVisible && "opacity-100"
        )}
        style={{
          pointerEvents: isVisible ? "auto" : "none",
        }}
      >
        <div
          ref={ref}
          className="h-full w-full bg-no-repeat"
          style={{
            backgroundImage: `url(${imageUrl})`,
            willChange: "background-position",
          }}
        />
      </div>
    )
  }
)

ZoomPanel.displayName = "ZoomPanel"
