export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function calculateLensPosition(
  cursorX: number,
  cursorY: number,
  lensWidth: number,
  lensHeight: number,
  imageWidth: number,
  imageHeight: number
) {
  // Center lens on cursor
  let x = cursorX - lensWidth / 2
  let y = cursorY - lensHeight / 2

  // Constrain to image boundaries
  x = clamp(x, 0, imageWidth - lensWidth)
  y = clamp(y, 0, imageHeight - lensHeight)

  return { x, y }
}
