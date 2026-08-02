import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DEFAULT_SEARCH_DEBOUNCE_MS,
  useDebouncedValue,
} from './useDebouncedValue'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useDebouncedValue', () => {
  it('atualiza o valor depois do atraso padrão', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value),
      { initialProps: { value: '' } },
    )

    rerender({ value: 'Ana' })
    expect(result.current).toBe('')

    act(() => {
      vi.advanceTimersByTime(DEFAULT_SEARCH_DEBOUNCE_MS - 1)
    })
    expect(result.current).toBe('')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('Ana')
  })

  it('cancela o atraso anterior quando o valor muda novamente', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value),
      { initialProps: { value: '' } },
    )

    rerender({ value: 'A' })
    act(() => {
      vi.advanceTimersByTime(300)
    })
    rerender({ value: 'Ana' })

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe('')

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe('Ana')
  })
})
