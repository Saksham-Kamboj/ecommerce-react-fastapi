import { useRef, useState } from "react"
import { useZoomTracking } from "./hooks"
import { ImageLens } from "./ImageLens"
import { ZoomPanel } from "./ZoomPanel"
import { Maximize2 } from "lucide-react"

interface MainImageProps {
  imageUrl: string
  zoomLevel?: number
  showZoomWindow?: boolean
  onFullscreen?: () => void
}

export function MainImage({
  imageUrl,
  zoomLevel = 2.5,
  showZoomWindow = true,
  onFullscreen,
}: MainImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const lensRef = useRef<HTMLDivElement>(null)
  const zoomPanelRef = useRef<HTMLDivElement>(null)

  const [isActive, setIsActive] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useZoomTracking({
    containerRef,
    lensRef,
    zoomPanelRef,
    zoomLevel,
    isActive: isActive && showZoomWindow && isLoaded,
  })

  return (
    <div className="relative flex w-full max-w-2xl flex-col items-center">
      <div
        ref={containerRef}
        className="relative flex aspect-[4/3] w-full cursor-crosshair items-center justify-center overflow-hidden rounded-2xl border bg-white p-4 shadow-sm"
        onMouseEnter={() => setIsActive(true)}
        onMouseLeave={() => setIsActive(false)}
        onClick={onFullscreen}
        onContextMenu={(e) => e.preventDefault()} // prevent right click
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        )}

        <img
          ref={imageRef}
          src={imageUrl}
          alt="Product"
          className="h-full w-full object-contain"
          onLoad={() => setIsLoaded(true)}
          style={{ userSelect: "none" }}
          draggable={false}
        />

        {showZoomWindow && isLoaded && (
          <ImageLens ref={lensRef} isVisible={isActive} />
        )}

        {/* Fullscreen Hint for Mobile/Tablet */}
        <div className="absolute right-4 bottom-4 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 lg:hidden lg:opacity-100">
          <Maximize2 className="h-4 w-4" />
        </div>
      </div>

      {showZoomWindow && isLoaded && (
        <ZoomPanel
          ref={zoomPanelRef}
          isVisible={isActive}
          imageUrl={imageUrl}
        />
      )}
    </div>
  )
}
