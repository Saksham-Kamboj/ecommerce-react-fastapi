import { useEffect, useRef } from "react"
import type { RefObject } from "react"
import { calculateLensPosition } from "./utils"

interface UseZoomTrackingProps {
  containerRef: RefObject<HTMLDivElement | null>
  lensRef: RefObject<HTMLDivElement | null>
  zoomPanelRef: RefObject<HTMLDivElement | null>
  zoomLevel: number
  isActive: boolean
}

export function useZoomTracking({
  containerRef,
  lensRef,
  zoomPanelRef,
  zoomLevel,
  isActive,
}: UseZoomTrackingProps) {
  const requestRef = useRef<number | undefined>(undefined)
  const lastMousePos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!isActive) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
      return
    }

    const updateZoom = () => {
      const container = containerRef.current
      const lens = lensRef.current
      const panel = zoomPanelRef.current

      if (!container || !lens || !panel) return

      const rect = container.getBoundingClientRect()

      // We only care if the mouse is inside the image bounds
      const cursorX = lastMousePos.current.x - rect.left
      const cursorY = lastMousePos.current.y - rect.top

      // Image actual displayed dimensions
      const imgWidth = rect.width
      const imgHeight = rect.height

      // Zoom panel dimensions (where the zoomed image is shown)
      const panelRect = panel.getBoundingClientRect()

      // Calculate lens size based on panel size and zoom level
      // If zoom is 2x, lens should be exactly half the size of the zoom panel
      const lensWidth = panelRect.width / zoomLevel
      const lensHeight = panelRect.height / zoomLevel

      // Update lens size
      lens.style.width = `${lensWidth}px`
      lens.style.height = `${lensHeight}px`

      // Calculate lens position
      const { x: lensX, y: lensY } = calculateLensPosition(
        cursorX,
        cursorY,
        lensWidth,
        lensHeight,
        imgWidth,
        imgHeight
      )

      // Move lens
      lens.style.transform = `translate3d(${lensX}px, ${lensY}px, 0)`

      // Calculate the ratio of how far the lens is across the image (0 to 1)
      const ratioX = lensX / (imgWidth - lensWidth || 1)
      const ratioY = lensY / (imgHeight - lensHeight || 1)

      // Background size needs to be exactly proportional
      // bgWidth = panelWidth * (imgWidth / lensWidth)
      // Since lensWidth = panelWidth / zoomLevel, then bgWidth = imgWidth * zoomLevel
      const bgWidth = imgWidth * zoomLevel
      const bgHeight = imgHeight * zoomLevel

      panel.style.backgroundSize = `${bgWidth}px ${bgHeight}px`

      // Max scroll position for the background
      const maxBgX = bgWidth - panelRect.width
      const maxBgY = bgHeight - panelRect.height

      // Background position
      const bgPosX = -(ratioX * maxBgX)
      const bgPosY = -(ratioY * maxBgY)

      panel.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`

      requestRef.current = requestAnimationFrame(updateZoom)
    }

    const handleMouseMove = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY }
      if (!requestRef.current) {
        requestRef.current = requestAnimationFrame(updateZoom)
      }
    }

    // Attach to window so if mouse moves really fast out of the container it still tracks until mouse leave fires
    window.addEventListener("mousemove", handleMouseMove, { passive: true })

    // Initial call to set sizes
    requestRef.current = requestAnimationFrame(updateZoom)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
      requestRef.current = undefined
    }
  }, [isActive, zoomLevel, containerRef, lensRef, zoomPanelRef])
}
