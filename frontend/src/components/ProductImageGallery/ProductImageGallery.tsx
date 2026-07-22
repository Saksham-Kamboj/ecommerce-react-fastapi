import { useState, useCallback, useMemo } from "react"
import { ThumbnailList } from "./ThumbnailList"
import { MainImage } from "./MainImage"
import { FullscreenViewer } from "./FullscreenViewer"
import type { ProductImageGalleryProps } from "./types"

export function ProductImageGallery({
  images,
  zoom = 2.5,
  showZoomWindow = true,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Fallback if no images
  const safeImages = useMemo(() => {
    if (!images || images.length === 0) return ["/placeholder.png"] // Fallback placeholder
    return images
  }, [images])

  const activeImage = safeImages[activeIndex] || safeImages[0]

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1))
  }, [safeImages.length])

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1))
  }, [safeImages.length])

  return (
    <div className="relative flex w-full flex-col gap-4 lg:flex-row lg:items-start">
      {/* 1. Left Thumbnail Gallery (Vertical on Desktop, Horizontal on Mobile) */}
      {safeImages.length > 1 && (
        <div className="order-2 lg:order-1 lg:w-20 lg:shrink-0">
          <ThumbnailList
            images={safeImages}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
        </div>
      )}

      {/* 2. Main Image Area */}
      <div className="order-1 w-full lg:order-2">
        <MainImage
          imageUrl={activeImage}
          zoomLevel={zoom}
          showZoomWindow={showZoomWindow}
          onFullscreen={() => setIsFullscreen(true)}
        />
      </div>

      {/* 3. Fullscreen Viewer Fallback (Mobile/Click) */}
      <FullscreenViewer
        images={safeImages}
        activeIndex={activeIndex}
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </div>
  )
}
