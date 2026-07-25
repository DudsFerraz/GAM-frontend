import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createEvent, getEventPresences } from './events'

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock('@/lib/http', () => ({ api: apiMocks }))

beforeEach(() => {
  apiMocks.get.mockReset()
  apiMocks.post.mockReset()
})

describe('events API', () => {
  it('retorna a representação completa do evento criado', async () => {
    const payload = {
      beginDate: '2026-07-25T18:00:00.000Z',
      endDate: '2026-07-25T20:00:00.000Z',
      gamLocationId: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Encontro semanal',
    }
    const createdEvent = {
      beginDate: payload.beginDate,
      endDate: payload.endDate,
      id: '019f6343-321a-7c90-a096-a551e8f88eb4',
      status: 'SCHEDULED' as const,
      title: payload.title,
      type: 'GENERIC' as const,
    }
    apiMocks.post.mockResolvedValueOnce({ data: createdEvent })

    await expect(createEvent(payload)).resolves.toEqual(createdEvent)
    expect(apiMocks.post).toHaveBeenCalledWith('/events', payload)
  })

  it('ordena as presenças pelo instante de registro aceito pelo contrato', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { items: [] } })

    await getEventPresences('event-id', 2)

    expect(apiMocks.get).toHaveBeenCalledWith('/events/event-id/presences', {
      params: { page: 2, size: 12, sort: ['registeredAt,asc'] },
      paramsSerializer: { indexes: null },
    })
  })
})
