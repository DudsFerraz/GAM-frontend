import { describe, expect, it } from 'vitest'

import { eventSchema } from './eventSchema'

const validEvent = {
  beginDate: '2026-08-01T10:00',
  description: 'Encontro mensal',
  endDate: '2026-08-01T11:00',
  locationId: '550e8400-e29b-41d4-a716-446655440000',
  requiredPermissionId: '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
  title: 'Encontro do GAM',
  type: 'GENERIC' as const,
}

describe('eventSchema', () => {
  it('aceita um evento coerente', () => {
    expect(eventSchema.safeParse(validEvent).success).toBe(true)
  })

  it.each([
    ['2026-08-01T10:00', 'O término deve ser posterior ao início.'],
    ['2026-08-01T09:59', 'O término deve ser posterior ao início.'],
  ])('rejeita término não posterior (%s)', (endDate, message) => {
    const result = eventSchema.safeParse({ ...validEvent, endDate })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.endDate).toContain(message)
    }
  })

  it('traduz seleções inválidas de local, público e tipo', () => {
    const result = eventSchema.safeParse({
      ...validEvent,
      locationId: 'local-técnico',
      requiredPermissionId: 'permissão-técnica',
      type: 'INTERNAL',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        locationId: ['Selecione um local válido.'],
        requiredPermissionId: ['Selecione o público do evento.'],
        type: ['Selecione um tipo de evento válido.'],
      })
    }
  })

  it('limita título e descrição com mensagens explícitas', () => {
    const result = eventSchema.safeParse({
      ...validEvent,
      description: 'a'.repeat(2001),
      title: 'a'.repeat(161),
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        description: ['A descrição deve ter no máximo 2.000 caracteres.'],
        title: ['O título deve ter no máximo 160 caracteres.'],
      })
    }
  })
})
