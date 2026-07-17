import { useRef, useCallback } from "react"

/**
 * Returns a debounced version of the given callback.
 * The callback fires only after `delay` ms have passed since the last invocation.
 * Each unique `key` gets its own independent timer — useful for per-item debouncing.
 *
 * @param delay - debounce delay in milliseconds
 */
export function useDebounce(delay: number) {
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const debounce = useCallback(
    (key: string, fn: () => void) => {
      if (timers.current[key]) {
        clearTimeout(timers.current[key])
      }
      timers.current[key] = setTimeout(() => {
        delete timers.current[key]
        fn()
      }, delay)
    },
    [delay]
  )

  const cancel = useCallback((key: string) => {
    if (timers.current[key]) {
      clearTimeout(timers.current[key])
      delete timers.current[key]
    }
  }, [])

  const cancelAll = useCallback(() => {
    Object.values(timers.current).forEach(clearTimeout)
    timers.current = {}
  }, [])

  return { debounce, cancel, cancelAll }
}
