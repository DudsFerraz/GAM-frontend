import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { oratorianoQueryKeys } from '../queryKeys'
import { useDeleteOratoriano } from './useOratorianos'

const apiMocks = vi.hoisted(() => ({
  deleteOratoriano: vi.fn(),
  getOratoriano: vi.fn(),
  getOratorianoAttendances: vi.fn(),
  getOratorianoAttendanceSummary: vi.fn(),
  registerOratoriano: vi.fn(),
  replaceOratoriano: vi.fn(),
  searchOratorianos: vi.fn(),
}))

vi.mock('../api/oratorianos', () => apiMocks)

beforeEach(() => {
  for (const mock of Object.values(apiMocks)) {
    mock.mockReset()
  }
})

describe('useDeleteOratoriano', () => {
  it('invalida listas e trackers sem refazer o detalhe excluído', async () => {
    apiMocks.deleteOratoriano.mockResolvedValueOnce(undefined)
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    })
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
    const { result } = renderHook(useDeleteOratoriano, { wrapper })

    await act(() => result.current.mutateAsync({
      oratorianoId: 'oratoriano-id',
      reason: 'Cadastro duplicado.',
    }))

    expect(apiMocks.deleteOratoriano).toHaveBeenCalledWith(
      'oratoriano-id',
      { reason: 'Cadastro duplicado.' },
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: oratorianoQueryKeys.lists(),
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['oratorios'],
    })
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: oratorianoQueryKeys.detail('oratoriano-id'),
    })
  })
})
