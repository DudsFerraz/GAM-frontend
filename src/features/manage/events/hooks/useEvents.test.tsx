import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  useRegisterEventPresence,
  useRemoveEventPresence,
  useUpdateEventPresenceObservations,
} from './useEvents'
import { eventQueryKeys } from '../queryKeys'
import { memberQueryKeys } from '@/features/manage/members/queryKeys'

const apiMocks = vi.hoisted(() => ({
  cancelEvent: vi.fn(),
  createEvent: vi.fn(),
  finalizeEvent: vi.fn(),
  getEvent: vi.fn(),
  getEventPresences: vi.fn(),
  lockEvent: vi.fn(),
  registerEventPresence: vi.fn(),
  removeEvent: vi.fn(),
  removeEventPresence: vi.fn(),
  reopenEvent: vi.fn(),
  replaceEvent: vi.fn(),
  searchEvents: vi.fn(),
  updateEventPresenceObservations: vi.fn(),
}))

vi.mock('../api/events', () => apiMocks)

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

  return { invalidateQueries, wrapper }
}

function expectPresenceHistoriesInvalidated(
  invalidateQueries: ReturnType<typeof vi.spyOn>,
) {
  expect(invalidateQueries).toHaveBeenCalledWith({
    queryKey: eventQueryKeys.presenceLists('event-id'),
  })
  expect(invalidateQueries).toHaveBeenCalledWith({
    queryKey: memberQueryKeys.presenceLists('member-id'),
  })
}

describe('mutações de Presença', () => {
  it('invalida os históricos após registrar', async () => {
    apiMocks.registerEventPresence.mockResolvedValueOnce({ id: 'presence-id' })
    const { invalidateQueries, wrapper } = createTestContext()
    const { result } = renderHook(useRegisterEventPresence, { wrapper })

    await act(() => result.current.mutateAsync({
      eventId: 'event-id',
      memberId: 'member-id',
      observations: null,
    }))

    expect(apiMocks.registerEventPresence).toHaveBeenCalledWith(
      'event-id',
      { memberId: 'member-id', observations: null },
    )
    expectPresenceHistoriesInvalidated(invalidateQueries)
  })

  it('invalida os históricos após editar observações', async () => {
    apiMocks.updateEventPresenceObservations.mockResolvedValueOnce({
      id: 'presence-id',
    })
    const { invalidateQueries, wrapper } = createTestContext()
    const { result } = renderHook(useUpdateEventPresenceObservations, {
      wrapper,
    })

    await act(() => result.current.mutateAsync({
      eventId: 'event-id',
      memberId: 'member-id',
      observations: 'Chegou após o início.',
    }))

    expect(apiMocks.updateEventPresenceObservations).toHaveBeenCalledWith(
      'event-id',
      'member-id',
      { observations: 'Chegou após o início.' },
    )
    expectPresenceHistoriesInvalidated(invalidateQueries)
  })

  it('invalida os históricos após remover', async () => {
    apiMocks.removeEventPresence.mockResolvedValueOnce(undefined)
    const { invalidateQueries, wrapper } = createTestContext()
    const { result } = renderHook(useRemoveEventPresence, { wrapper })

    await act(() => result.current.mutateAsync({
      eventId: 'event-id',
      memberId: 'member-id',
      reason: 'Registro incorreto.',
    }))

    expect(apiMocks.removeEventPresence).toHaveBeenCalledWith(
      'event-id',
      'member-id',
      { reason: 'Registro incorreto.' },
    )
    expectPresenceHistoriesInvalidated(invalidateQueries)
  })
})
