import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { oratorianoFormQueryKeys } from '../queryKeys'
import { useOratorianoFormHistory } from './useOratorianoForms'

const apiMocks = vi.hoisted(() => ({
  getOratorianoFormHistory: vi.fn(),
}))

vi.mock('../api/oratorianoForms', () => apiMocks)

function createHarness() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  return { queryClient, wrapper }
}

beforeEach(() => {
  apiMocks.getOratorianoFormHistory.mockReset()
})

describe('useOratorianoFormHistory', () => {
  it('usa a chave estável e consulta a página autorizada', async () => {
    apiMocks.getOratorianoFormHistory.mockResolvedValueOnce({ items: [] })
    const { queryClient, wrapper } = createHarness()

    const { result } = renderHook(
      () => useOratorianoFormHistory('oratoriano-id', 2, true),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiMocks.getOratorianoFormHistory)
      .toHaveBeenCalledWith('oratoriano-id', 2, 10)
    expect(queryClient.getQueryState(
      oratorianoFormQueryKeys.history('oratoriano-id', 2),
    )).toBeDefined()
  })

  it('não consulta sem a permissão de histórico', () => {
    const { wrapper } = createHarness()

    renderHook(
      () => useOratorianoFormHistory('oratoriano-id', 0, false),
      { wrapper },
    )

    expect(apiMocks.getOratorianoFormHistory).not.toHaveBeenCalled()
  })

  it('preserva a página anterior durante a atualização', async () => {
    let resolveSecondPage: ((value: { items: { version: number }[] }) => void)
      | undefined
    apiMocks.getOratorianoFormHistory
      .mockResolvedValueOnce({ items: [{ version: 1 }], page: 0 })
      .mockImplementationOnce(() => new Promise((resolve) => {
        resolveSecondPage = resolve
      }))
    const { wrapper } = createHarness()
    const { result, rerender } = renderHook(
      ({ page }) => useOratorianoFormHistory(
        'oratoriano-id',
        page,
        true,
      ),
      { initialProps: { page: 0 }, wrapper },
    )

    await waitFor(() => expect(result.current.data?.page).toBe(0))
    rerender({ page: 1 })

    await waitFor(() => expect(result.current.isPlaceholderData).toBe(true))
    expect(result.current.data?.items?.[0]?.version).toBe(1)

    await act(async () => {
      resolveSecondPage?.({ items: [{ version: 2 }] })
    })
    await waitFor(() => {
      expect(result.current.data?.items?.[0]?.version).toBe(2)
    })
  })
})
