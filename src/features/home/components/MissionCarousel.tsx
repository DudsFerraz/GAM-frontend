import { useEffect, useState } from 'react'

import { missionSlides } from '@/components/missionSlides'
import { cn } from '@/lib/utils'

const DESKTOP_QUERY = '(min-width: 768px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const SLIDE_INTERVAL_MS = 5000

function getMediaQueryMatch(query: string): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(query).matches
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => getMediaQueryMatch(query))

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia(query)
    const updateMatch = (event: MediaQueryListEvent) => setMatches(event.matches)

    mediaQuery.addEventListener('change', updateMatch)

    return () => mediaQuery.removeEventListener('change', updateMatch)
  }, [query])

  return matches
}

function MissionCarousel() {
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY)
  const [currentSlide, setCurrentSlide] = useState(0)
  const slide = missionSlides[currentSlide]

  useEffect(() => {
    if (prefersReducedMotion) {
      return
    }

    const intervalId = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % missionSlides.length)
    }, SLIDE_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [prefersReducedMotion])

  return (
    <aside
      aria-label="Nosso propósito"
      className="absolute bottom-8 right-8 hidden h-[62%] w-[48%] overflow-hidden rounded-2xl border border-white/15 bg-[#092c4a] shadow-xl md:block lg:bottom-10 lg:right-10 lg:h-[64%] lg:w-[46%] xl:w-[44%]"
    >
      <img
        alt=""
        aria-hidden="true"
        className={cn(
          'absolute inset-0 h-full w-full object-cover',
          !prefersReducedMotion && 'animate-in fade-in duration-700',
        )}
        key={slide.image}
        src={slide.image}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#092c4a] via-[#092c4a]/40 to-transparent" />

      <div
        className={cn(
          'absolute bottom-5 left-5 right-5 text-white lg:bottom-6 lg:left-6 lg:right-6',
          !prefersReducedMotion && 'animate-in fade-in slide-in-from-bottom-2 duration-500',
        )}
        key={slide.quotation}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
          Nosso propósito
        </p>
        <p className="mt-2 font-heading text-xl font-bold leading-snug tracking-tight lg:text-2xl">
          {slide.quotation}
        </p>
      </div>

    </aside>
  )
}

export function ResponsiveMissionCarousel() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  return isDesktop ? <MissionCarousel /> : null
}
