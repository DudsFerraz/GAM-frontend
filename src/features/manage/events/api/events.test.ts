import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  cancelEvent,
  createEvent,
  finalizeEvent,
  getEventPresences,
  lockEvent,
  removeEvent,
  reopenEvent,
  replaceEvent,
} from './events'

const apiMocks = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}))

vi.mock('@/lib/http', () => ({ api: apiMocks }))

beforeEach(() => {
  apiMocks.delete.mockReset()
  apiMocks.get.mockReset()
  apiMocks.patch.mockReset()
  apiMocks.post.mockReset()
  apiMocks.put.mockReset()
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

  it('substitui integralmente um evento genérico', async () => {
    const payload = {
      beginDate: '2026-08-01T13:00:00.000Z',
      endDate: '2026-08-01T14:00:00.000Z',
      gamLocationId: 'location-id',
      reason: 'Correção da programação.',
      title: 'Programação atualizada',
    }
    apiMocks.put.mockResolvedValueOnce({ data: { id: 'event-id' } })

    await replaceEvent('event-id', payload)

    expect(apiMocks.put).toHaveBeenCalledWith('/events/event-id', payload)
  })

  it('executa bloqueio e finalização sem corpo técnico', async () => {
    apiMocks.patch.mockResolvedValue({ data: { id: 'event-id' } })

    await lockEvent('event-id')
    await finalizeEvent('event-id')

    expect(apiMocks.patch).toHaveBeenNthCalledWith(1, '/events/event-id/lock')
    expect(apiMocks.patch).toHaveBeenNthCalledWith(2, '/events/event-id/finalize')
  })

  it('envia os corpos de cancelamento e reabertura', async () => {
    apiMocks.patch.mockResolvedValue({ data: { id: 'event-id' } })

    await cancelEvent('event-id', { reason: 'Evento cancelado pela organização.' })
    await reopenEvent('event-id', {
      reason: 'Necessidade de corrigir as presenças.',
      targetStatus: 'COMPLETED',
    })

    expect(apiMocks.patch).toHaveBeenNthCalledWith(
      1,
      '/events/event-id/cancel',
      { reason: 'Evento cancelado pela organização.' },
    )
    expect(apiMocks.patch).toHaveBeenNthCalledWith(
      2,
      '/events/event-id/reopen',
      {
        reason: 'Necessidade de corrigir as presenças.',
        targetStatus: 'COMPLETED',
      },
    )
  })

  it('remove um evento com o motivo no corpo da requisição', async () => {
    apiMocks.delete.mockResolvedValueOnce({})

    await removeEvent('event-id', { reason: 'Cadastro duplicado.' })

    expect(apiMocks.delete).toHaveBeenCalledWith('/events/event-id', {
      data: { reason: 'Cadastro duplicado.' },
    })
  })
})
