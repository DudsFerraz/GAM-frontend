import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUpdateMemberOratorioCoordinator } from './useUpdateMemberOratorioCoordinator'

const apiMocks = vi.hoisted(() => ({
  updateMemberOratorioCoordinator: vi.fn(),
}))

vi.mock('../api/updateMemberOratorioCoordinator', () => apiMocks)

beforeEach(() => {
  apiMocks.updateMemberOratorioCoordinator.mockReset()
  apiMocks.updateMemberOratorioCoordinator.mockResolvedValue(undefined)
})

describe('useUpdateMemberOratorioCoordinator', () => {
  it('invalida consultas de membros depois da transição', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    })
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
    const { result } = renderHook(
      () => useUpdateMemberOratorioCoordinator(),
      { wrapper },
    )

    await act(async () => {
      await result.current.mutateAsync({
        action: 'grant',
        memberId: 'member-id',
        reason: 'Apoio ao Oratório',
      })
    })

    expect(apiMocks.updateMemberOratorioCoordinator).toHaveBeenCalledWith(
      'member-id',
      'grant',
      { reason: 'Apoio ao Oratório' },
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['members'],
    })
  })
})
