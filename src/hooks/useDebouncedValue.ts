import { useEffect, useState } from 'react'

export const DEFAULT_SEARCH_DEBOUNCE_MS = 500

export function useDebouncedValue<T>(
  value: T,
  delay = DEFAULT_SEARCH_DEBOUNCE_MS,
): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)

    return () => clearTimeout(timer)
  }, [delay, value])

  return debouncedValue
}
