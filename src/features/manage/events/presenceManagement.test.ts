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

describe('getPresenceRegistrationAvailability', () => {
  it('explica quando a janela de presença ainda não abriu', () => {
    expect(getPresenceRegistrationAvailability(
      scheduledEvent,
      new Date('2026-08-01T12:59:59.000Z'),
    )).toEqual({
      state: 'before-window',
      message:
        'O registro ficará disponível quando a janela de presença deste evento estiver aberta.',
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

  it('usa uma mensagem neutra quando a janela não pode ser determinada', () => {
    expect(getPresenceRegistrationAvailability({
      ...scheduledEvent,
      beginDate: 'data-inválida',
    })).toEqual({
      state: 'unavailable',
      message:
        'Não foi possível determinar a janela de presença deste evento. Atualize a página e tente novamente.',
    })
  })

  it('orienta uma nova tentativa quando faltam dados para avaliar a janela', () => {
    expect(getPresenceRegistrationAvailability({
      ...scheduledEvent,
      beginDate: undefined,
    })).toEqual({
      state: 'unavailable',
      message:
        'Não foi possível determinar a janela de presença deste evento. Atualize a página e tente novamente.',
    })
  })

  it('mantém o registro indisponível quando o instante de avaliação é inválido', () => {
    const invalidEvaluationInstant = new Date('data-inválida')

    expect(getPresenceRegistrationAvailability(
      scheduledEvent,
      invalidEvaluationInstant,
    )).toEqual({
      state: 'unavailable',
      message:
        'Não foi possível determinar a janela de presença deste evento. Atualize a página e tente novamente.',
    })
    expect(canRegisterPresence(
      scheduledEvent,
      invalidEvaluationInstant,
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
