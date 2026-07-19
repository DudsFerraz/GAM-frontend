import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { registerMemberSchema } from './registerMemberSchema'

const validMember = {
  accountId: '550e8400-e29b-41d4-a716-446655440000',
  birthDate: '2000-01-01',
  firstName: 'Maria',
  phoneNumber: '+5519999999999',
  reason: 'Cadastro aprovado pela coordenação',
  surname: 'Silva',
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-07-19T15:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('registerMemberSchema', () => {
  it('aceita uma pessoa que completa 17 anos hoje', () => {
    const result = registerMemberSchema.safeParse({
      ...validMember,
      birthDate: '2009-07-19',
    })

    expect(result.success).toBe(true)
  })

  it.each(['2009-07-20', 'data-inválida', '2030-01-01'])(
    'rejeita uma data inelegível (%s)',
    (birthDate) => {
      const result = registerMemberSchema.safeParse({ ...validMember, birthDate })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.birthDate).toContain(
          'A pessoa deve ter pelo menos 17 anos.',
        )
      }
    },
  )

  it('rejeita identificador e telefone inválidos sem mensagens de biblioteca', () => {
    const result = registerMemberSchema.safeParse({
      ...validMember,
      accountId: 'id-interno',
      phoneNumber: '(19) 99999-9999',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        accountId: ['Selecione uma conta válida.'],
        phoneNumber: ['Use o formato internacional, como +5519999999999.'],
      })
    }
  })

  it('remove espaços dos campos textuais', () => {
    const result = registerMemberSchema.parse({
      ...validMember,
      firstName: '  Maria  ',
      surname: '  Silva  ',
    })

    expect(result.firstName).toBe('Maria')
    expect(result.surname).toBe('Silva')
  })
})
