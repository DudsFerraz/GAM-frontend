import { useEffect, useState } from 'react'

export function useOratorioClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(interval)
  }, [])

  return now
}
