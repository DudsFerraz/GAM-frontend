import { describe, expect, it, beforeEach, vi } from 'vitest'

import type { EventSearch } from '@/features/manage/events'

import {
  getAllOratorioEvents,
  paginateOratorioEvents,
} from './useOratorioSearch'

const apiMocks = vi.hoisted(() => ({
  searchEvents: vi.fn(),
}))

vi.mock('@/features/manage/events', async () => {
  const actual = await vi.importActual<typeof import('@/features/manage/events')>(
    '@/features/manage/events',
  )

  return {
    ...actual,
    searchEvents: apiMocks.searchEvents,
  }
})

beforeEach(() => {
  apiMocks.searchEvents.mockReset()
})

const search: EventSearch = {
  filters: { title: '', status: 'ALL', type: 'ORATORIO' },
  sorts: [],
}

describe('consulta ampla de datas do Oratório', () => {
  it('combina todas as páginas retornadas pelo backend', async () => {
    apiMocks.searchEvents
      .mockResolvedValueOnce({
        items: [{ id: 'first' }],
        last: false,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        items: [{ id: 'second' }],
        last: true,
        totalPages: 2,
      })

    await expect(getAllOratorioEvents(search)).resolves.toEqual([
      { id: 'first' },
      { id: 'second' },
    ])
    expect(apiMocks.searchEvents).toHaveBeenNthCalledWith(1, search, 0, 100)
    expect(apiMocks.searchEvents).toHaveBeenNthCalledWith(2, search, 1, 100)
  })

  it('repagina os resultados filtrados em blocos de doze', () => {
    const events = Array.from({ length: 13 }, (_, index) => ({
      id: `event-${index}`,
    }))

    expect(paginateOratorioEvents(events, 1)).toMatchObject({
      items: [{ id: 'event-12' }],
      page: 1,
      size: 12,
      totalElements: 13,
      totalPages: 2,
    })
  })
})
