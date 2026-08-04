import { describe, expect, it } from 'vitest'

import {
  canChangePresence,
  canRegisterPresence,
  getPresenceRegistrationAvailability,
} from './presenceManagement'
import type { Event } from './api/events'

const scheduledEvent = {
  beginDate: '2026-08-01T13:00:00.000Z',
  status: 'SCHEDULED' as const,
  type: 'GENERIC' as const,
}

describe('canRegisterPresence', () => {
  it('permite registrar um evento agendado antes do início', () => {
    expect(canRegisterPresence({
      ...scheduledEvent,
      beginDate: '2036-08-01T13:00:00.000Z',
    })).toBe(true)
  })

  it('permite registrar um evento concluído depois do término', () => {
    expect(canRegisterPresence({
      ...scheduledEvent,
      beginDate: '2020-08-01T13:00:00.000Z',
      status: 'COMPLETED',
    })).toBe(true)
  })

  it('não oferece registro após o fechamento administrativo', () => {
    expect(canRegisterPresence({ ...scheduledEvent, status: 'LOCKED' })).toBe(false)
  })
})

describe('getPresenceRegistrationAvailability', () => {
  it('não depende da data para liberar um evento agendado', () => {
    expect(getPresenceRegistrationAvailability({
      ...scheduledEvent,
      beginDate: '2036-08-01T13:00:00.000Z',
    })).toEqual({
      state: 'available',
      message: null,
    })
  })

  it('não exige datas nem tipo para uma situação aberta', () => {
    expect(getPresenceRegistrationAvailability({
      status: 'SCHEDULED',
    })).toEqual({
      state: 'available',
      message: null,
    })
  })

  it('não depende da data para liberar um evento concluído', () => {
    expect(getPresenceRegistrationAvailability({
      ...scheduledEvent,
      beginDate: '2020-08-01T13:00:00.000Z',
      status: 'COMPLETED',
    })).toEqual({
      state: 'available',
      message: null,
    })
  })

  it.each([
    [
      'CANCELLED',
      'Este evento foi cancelado e não aceita novos registros de presença.',
    ],
    [
      'LOCKED',
      'As presenças deste evento estão bloqueadas e não aceitam novos registros.',
    ],
    [
      'FINALIZED',
      'Este evento foi finalizado e não aceita novos registros de presença.',
    ],
  ] as const)(
    'apresenta uma explicação segura para a situação %s',
    (status, message) => {
      const availability = getPresenceRegistrationAvailability({
        ...scheduledEvent,
        status,
      })

      expect(availability).toEqual({ state: 'closed-status', message })
      expect(availability.message).not.toContain(status)
    },
  )

  it('usa uma mensagem neutra quando falta a situação do evento', () => {
    expect(getPresenceRegistrationAvailability({
      beginDate: '2036-08-01T13:00:00.000Z',
    })).toEqual({
      state: 'unavailable',
      message:
        'Não foi possível determinar a disponibilidade do registro de presença deste evento. Atualize a página e tente novamente.',
    })
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
