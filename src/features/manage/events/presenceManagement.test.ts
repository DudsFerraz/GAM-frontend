import { describe, expect, it } from 'vitest'

import {
  canChangePresence,
  canRegisterPresence,
} from './presenceManagement'
import type { Event } from './api/events'

const scheduledEvent = {
  beginDate: '2026-08-01T13:00:00.000Z',
  status: 'SCHEDULED' as const,
  type: 'GENERIC' as const,
}

describe('canRegisterPresence', () => {
  it('abre a janela comum no início do evento', () => {
    expect(canRegisterPresence(
      scheduledEvent,
      new Date('2026-08-01T12:59:59.000Z'),
    )).toBe(false)
    expect(canRegisterPresence(
      scheduledEvent,
      new Date('2026-08-01T13:00:00.000Z'),
    )).toBe(true)
  })

  it('abre a janela do Oratório trinta minutos antes', () => {
    expect(canRegisterPresence(
      { ...scheduledEvent, type: 'ORATORIO' },
      new Date('2026-08-01T12:30:00.000Z'),
    )).toBe(true)
  })

  it('não oferece registro após o fechamento administrativo', () => {
    expect(canRegisterPresence(
      { ...scheduledEvent, status: 'LOCKED' },
      new Date('2026-08-01T14:00:00.000Z'),
    )).toBe(false)
  })
})

describe('canChangePresence', () => {
  it.each([
    ['SCHEDULED', true],
    ['COMPLETED', true],
    ['CANCELLED', true],
    ['LOCKED', false],
    ['FINALIZED', false],
  ])('avalia a situação %s', (status, expected) => {
    expect(canChangePresence({
      ...scheduledEvent,
      status: status as Event['status'],
    })).toBe(expected)
  })
})
