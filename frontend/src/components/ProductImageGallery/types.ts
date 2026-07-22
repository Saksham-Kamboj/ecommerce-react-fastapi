export interface ProductImageGalleryProps {
  images: string[]
  zoom?: number
  lensSize?: number // Optional forced size, otherwise auto-calculated
  showZoomWindow?: boolean
}
