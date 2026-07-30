import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ResponsiveMissionCarousel } from './MissionCarousel'

const DESKTOP_QUERY = '(min-width: 768px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

type MediaListener = (event: MediaQueryListEvent) => void

function installMatchMedia(initialMatches: Record<string, boolean>) {
  const matches = new Map(Object.entries(initialMatches))
  const listeners = new Map<string, Set<MediaListener>>()

  const matchMedia = vi.fn((query: string) => {
    const queryListeners = listeners.get(query) ?? new Set<MediaListener>()
    listeners.set(query, queryListeners)

    return {
      addEventListener: (_type: string, listener: MediaListener) => queryListeners.add(listener),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: matches.get(query) ?? false,
      media: query,
      onchange: null,
      removeEventListener: (_type: string, listener: MediaListener) => queryListeners.delete(listener),
      removeListener: vi.fn(),
    } as MediaQueryList
  })

  vi.stubGlobal('matchMedia', matchMedia)

  return {
    setMatch(query: string, nextMatch: boolean) {
      matches.set(query, nextMatch)
      listeners.get(query)?.forEach((listener) => {
        listener({ matches: nextMatch, media: query } as MediaQueryListEvent)
      })
    },
  }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('ResponsiveMissionCarousel', () => {
  it('não monta o carrossel nem inicia intervalo abaixo de 768 px', () => {
    installMatchMedia({
      [DESKTOP_QUERY]: false,
      [REDUCED_MOTION_QUERY]: false,
    })
    const intervalSpy = vi.spyOn(window, 'setInterval')

    render(<ResponsiveMissionCarousel />)

    expect(screen.queryByLabelText('Nosso propósito')).not.toBeInTheDocument()
    expect(intervalSpy).not.toHaveBeenCalled()
  })

  it('avança imagem e frase automaticamente em telas elegíveis', () => {
    installMatchMedia({
      [DESKTOP_QUERY]: true,
      [REDUCED_MOTION_QUERY]: false,
    })

    render(<ResponsiveMissionCarousel />)

    expect(screen.getByText('“Leva-me aonde os homens necessitem a Tua palavra”')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByText('“Basta que sejam jovens para que eu os ame”')).toBeInTheDocument()
  })

  it('permanece estático quando há preferência por movimento reduzido', () => {
    installMatchMedia({
      [DESKTOP_QUERY]: true,
      [REDUCED_MOTION_QUERY]: true,
    })

    render(<ResponsiveMissionCarousel />)

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(screen.getByText('“Leva-me aonde os homens necessitem a Tua palavra”')).toBeInTheDocument()
  })

  it('monta e remove o carrossel quando a tela cruza o breakpoint', () => {
    const media = installMatchMedia({
      [DESKTOP_QUERY]: false,
      [REDUCED_MOTION_QUERY]: false,
    })

    render(<ResponsiveMissionCarousel />)

    act(() => media.setMatch(DESKTOP_QUERY, true))
    expect(screen.getByLabelText('Nosso propósito')).toBeInTheDocument()
    expect(vi.getTimerCount()).toBe(1)

    act(() => media.setMatch(DESKTOP_QUERY, false))
    expect(screen.queryByLabelText('Nosso propósito')).not.toBeInTheDocument()
    expect(vi.getTimerCount()).toBe(0)
  })
})
