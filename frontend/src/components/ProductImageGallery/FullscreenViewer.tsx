import { useEffect } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FullscreenViewerProps {
  images: string[]
  activeIndex: number
  isOpen: boolean
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

export function FullscreenViewer({
  images,
  activeIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: FullscreenViewerProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") onNext()
      if (e.key === "ArrowLeft") onPrev()
    }

    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden" // Prevent scroll

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose, onNext, onPrev])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 z-50 p-6 text-white">
        <p className="text-sm font-medium text-gray-400">
          {activeIndex + 1} / {images.length}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-6 right-6 z-50 rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Main Image */}
      <div className="relative flex h-[80vh] w-full items-center justify-center p-4">
        <img
          src={images[activeIndex]}
          alt="Fullscreen"
          className="max-h-full max-w-full object-contain"
          style={{ userSelect: "none" }}
        />

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/80"
              onClick={onPrev}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/80"
              onClick={onNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Bar */}
      {images.length > 1 && (
        <div className="absolute bottom-4 flex gap-2">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === activeIndex ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
