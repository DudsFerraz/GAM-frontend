import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { toPhoneE164 } from '../phone'
import { reviewSchema, solicitationSchema } from './solicitationSchemas'

const validSolicitation = {
  birthDate: '2000-01-01',
  firstName: 'João',
  justification: 'Desejo participar das atividades do grupo.',
  phoneNumber: '+55 (19) 99999-9999',
  surname: 'Souza',
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-07-19T15:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('solicitationSchema', () => {
  it('aceita o telefone brasileiro completo e a idade mínima', () => {
    expect(solicitationSchema.safeParse({
      ...validSolicitation,
      birthDate: '2009-07-19',
    }).success).toBe(true)
  })

  it('rejeita telefone incompleto com exemplo acionável', () => {
    const result = solicitationSchema.safeParse({
      ...validSolicitation,
      phoneNumber: '(19) 99999-9999',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.phoneNumber).toContain(
        'Informe um telefone válido, como +55 (19) 99999-9999.',
      )
    }
  })

  it('rejeita uma pessoa abaixo da idade mínima', () => {
    const result = solicitationSchema.safeParse({
      ...validSolicitation,
      birthDate: '2009-07-20',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.birthDate).toContain(
        'É necessário ter pelo menos 17 anos.',
      )
    }
  })
})

describe('reviewSchema', () => {
  it('exige e limita o motivo da decisão', () => {
    const empty = reviewSchema.safeParse({ reason: '   ' })
    const tooLong = reviewSchema.safeParse({ reason: 'a'.repeat(2001) })

    expect(empty.success).toBe(false)
    expect(tooLong.success).toBe(false)
    if (!empty.success && !tooLong.success) {
      expect(empty.error.flatten().fieldErrors.reason).toContain(
        'Informe o motivo da decisão.',
      )
      expect(tooLong.error.flatten().fieldErrors.reason).toContain(
        'O motivo deve ter no máximo 2.000 caracteres.',
      )
    }
  })
})

describe('toPhoneE164', () => {
  it.each([
    ['+55 (19) 99999-9999', '+5519999999999'],
    ['(19) 99999-9999', '+5519999999999'],
  ])('converte %s para o formato da API', (input, expected) => {
    expect(toPhoneE164(input)).toBe(expected)
  })
})
