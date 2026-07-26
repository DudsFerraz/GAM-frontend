import { useCallback, useState } from 'react'

type CapabilityBoundState<T> = {
  capability: boolean
  value: T
}

export function useCapabilityBoundState<T>(
  capability: boolean,
  initialValue: T,
): [T, (value: T) => void] {
  const [state, setState] = useState<CapabilityBoundState<T>>({
    capability,
    value: initialValue,
  })

  if (state.capability !== capability) {
    setState({ capability, value: initialValue })
  }

  const setValue = useCallback(
    (value: T) => setState({ capability, value }),
    [capability],
  )
  const value = state.capability === capability
    ? state.value
    : initialValue

  return [capability ? value : initialValue, setValue]
}
