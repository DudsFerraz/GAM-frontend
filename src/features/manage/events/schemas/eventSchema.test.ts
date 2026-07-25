import { describe, expect, it } from 'vitest'

import { eventSchema } from './eventSchema'

const validEvent = {
  beginDate: '2026-08-01T10:00',
  description: 'Encontro mensal',
  endDate: '2026-08-01T11:00',
  locationId: '550e8400-e29b-41d4-a716-446655440000',
  requiredPermissionId: '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
  title: 'Encontro do GAM',
}

describe('eventSchema', () => {
  it('aceita um evento coerente', () => {
    expect(eventSchema.safeParse(validEvent).success).toBe(true)
  })

  it('aceita um evento para o público geral', () => {
    expect(eventSchema.safeParse({
      ...validEvent,
      requiredPermissionId: '',
    }).success).toBe(true)
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

  it('traduz seleções inválidas de local e público', () => {
    const result = eventSchema.safeParse({
      ...validEvent,
      locationId: 'local-técnico',
      requiredPermissionId: 'permissão-técnica',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        locationId: ['Selecione um local válido.'],
        requiredPermissionId: ['Selecione um público válido.'],
      })
    }
  })

  it('aceita título e descrição nos limites do contrato', () => {
    const result = eventSchema.safeParse({
      ...validEvent,
      description: 'a'.repeat(10000),
      title: 'a'.repeat(255),
    })

    expect(result.success).toBe(true)
  })

  it('rejeita título e descrição acima dos limites do contrato', () => {
    const result = eventSchema.safeParse({
      ...validEvent,
      description: 'a'.repeat(10001),
      title: 'a'.repeat(256),
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        description: ['A descrição deve ter no máximo 10.000 caracteres.'],
        title: ['O título deve ter no máximo 255 caracteres.'],
      })
    }
  })
})
