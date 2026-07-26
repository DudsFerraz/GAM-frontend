import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useCapabilityBoundState } from './useCapabilityBoundState'

describe('useCapabilityBoundState', () => {
  it('descarta o estado quando a capacidade muda', () => {
    const { result, rerender } = renderHook(
      ({ capability }) =>
        useCapabilityBoundState<string | null>(capability, null),
      { initialProps: { capability: true } },
    )

    act(() => result.current[1]('dialog-open'))
    expect(result.current[0]).toBe('dialog-open')

    rerender({ capability: false })
    expect(result.current[0]).toBeNull()

    rerender({ capability: true })
    expect(result.current[0]).toBeNull()
  })
})
