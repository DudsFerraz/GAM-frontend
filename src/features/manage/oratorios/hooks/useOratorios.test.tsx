import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { oratorianoQueryKeys } from '@/features/manage/oratorianos'

import { oratorioQueryKeys } from '../queryKeys'
import {
  useExactOratorianoAttendanceMatch,
  useMarkAttendance,
  useUncheckAttendance,
} from './useOratorios'

const apiMocks = vi.hoisted(() => ({
  getAttendanceRoster: vi.fn(),
  markAttendance: vi.fn(),
  uncheckAttendance: vi.fn(),
}))

vi.mock('../api/oratorios', () => apiMocks)

beforeEach(() => {
  for (const mock of Object.values(apiMocks)) {
    mock.mockReset()
  }
})

function createTestContext() {
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

  return { invalidateQueries, queryClient, wrapper }
}

function expectAttendanceDataInvalidated(
  invalidateQueries: ReturnType<typeof vi.spyOn>,
) {
  expect(invalidateQueries).toHaveBeenCalledWith({
    queryKey: oratorioQueryKeys.rosters(
      'oratorio-id',
      'oratorianos',
    ),
  })
  expect(invalidateQueries).toHaveBeenCalledWith({
    queryKey: oratorioQueryKeys.present('oratorio-id'),
  })
  expect(invalidateQueries).toHaveBeenCalledWith({
    queryKey: oratorianoQueryKeys.detail('oratoriano-id'),
  })
}

describe('mutações de presença do Oratório', () => {
  it('invalida histórico e resumo do Oratoriano após marcar', async () => {
    apiMocks.markAttendance.mockResolvedValueOnce({
      id: 'attendance-id',
      person: { id: 'oratoriano-id' },
    })
    const { invalidateQueries, queryClient, wrapper } = createTestContext()
    const { result } = renderHook(useMarkAttendance, { wrapper })

    await act(() => result.current.mutateAsync({
      kind: 'oratorianos',
      oratorioId: 'oratorio-id',
      personId: 'oratoriano-id',
    }))

    expectAttendanceDataInvalidated(invalidateQueries)
    expect(
      queryClient.getQueryData(
        oratorioQueryKeys.present('oratorio-id'),
      ),
    ).toBeUndefined()
  })

  it('invalida histórico e resumo do Oratoriano após desmarcar', async () => {
    apiMocks.uncheckAttendance.mockResolvedValueOnce(undefined)
    const { invalidateQueries, wrapper } = createTestContext()
    const { result } = renderHook(useUncheckAttendance, { wrapper })

    await act(() => result.current.mutateAsync({
      kind: 'oratorianos',
      oratorioId: 'oratorio-id',
      personId: 'oratoriano-id',
      reason: 'Marcação incorreta.',
    }))

    expectAttendanceDataInvalidated(invalidateQueries)
  })

  it('invalida o roster mesmo quando a marcação falha', async () => {
    apiMocks.markAttendance.mockRejectedValueOnce(new Error('Falha'))
    const { invalidateQueries, wrapper } = createTestContext()
    const { result } = renderHook(useMarkAttendance, { wrapper })

    await expect(
      act(() => result.current.mutateAsync({
        kind: 'oratorianos',
        oratorioId: 'oratorio-id',
        personId: 'oratoriano-id',
      })),
    ).rejects.toThrow()

    expectAttendanceDataInvalidated(invalidateQueries)
  })
})

describe('conferência de nome do Oratoriano', () => {
  it('procura um nome equivalente em todas as páginas retornadas', async () => {
    apiMocks.getAttendanceRoster
      .mockResolvedValueOnce({
        items: [{
          person: {
            firstName: 'João',
            id: 'similar-id',
            surname: 'Silveira',
          },
        }],
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        items: [{
          person: {
            firstName: 'JOAO',
            id: 'exact-id',
            surname: 'SILVA',
          },
        }],
        totalPages: 2,
      })
    const { wrapper } = createTestContext()
    const { result } = renderHook(
      () => useExactOratorianoAttendanceMatch(
        'oratorio-id',
        'João',
        'Silva',
      ),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.person?.id).toBe('exact-id')
    expect(apiMocks.getAttendanceRoster).toHaveBeenNthCalledWith(
      1,
      'oratorio-id',
      'oratorianos',
      0,
      'João Silva',
      expect.any(AbortSignal),
    )
    expect(apiMocks.getAttendanceRoster).toHaveBeenNthCalledWith(
      2,
      'oratorio-id',
      'oratorianos',
      1,
      'João Silva',
      expect.any(AbortSignal),
    )
  })
})
