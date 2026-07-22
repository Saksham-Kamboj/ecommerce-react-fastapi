import { cn } from "@/lib/utils"

interface ThumbnailListProps {
  images: string[]
  activeIndex: number
  onSelect: (index: number) => void
}

export function ThumbnailList({
  images,
  activeIndex,
  onSelect,
}: ThumbnailListProps) {
  if (images.length <= 1) return null

  return (
    <div className="flex flex-row gap-3 overflow-x-auto p-1 lg:flex-col lg:overflow-visible">
      {images.map((image, index) => {
        const isActive = activeIndex === index
        return (
          <button
            key={image + index}
            type="button"
            className={cn(
              "relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-white transition-all hover:border-primary/50",
              isActive ? "border-primary shadow-sm" : "border-transparent"
            )}
            onClick={() => onSelect(index)}
            onMouseEnter={() => onSelect(index)} // Amazon style hover
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="h-full w-full object-contain p-1"
              loading="lazy"
            />
          </button>
        )
      })}
    </div>
  )
}
