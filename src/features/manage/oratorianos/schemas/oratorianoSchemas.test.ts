import { describe, expect, it } from 'vitest'

import {
  createReplaceOratorianoSchema,
  deleteOratorianoSchema,
  registerOratorianoSchema,
} from './oratorianoSchemas'

describe('schemas de Oratoriano', () => {
  it('aceita letras Unicode e separadores internos simples', () => {
    expect(registerOratorianoSchema.safeParse({
      firstName: 'João-Paulo',
      surname: "D'Ávila",
    }).success).toBe(true)
  })

  it.each([
    { firstName: 'A', surname: 'Souza' },
    { firstName: ' Ana', surname: 'Souza' },
    { firstName: 'Ana  Maria', surname: 'Souza' },
    { firstName: 'Ana_', surname: 'Souza' },
  ])('rejeita componente de nome inválido: $firstName', (value) => {
    expect(registerOratorianoSchema.safeParse(value).success).toBe(false)
  })

  it('rejeita nascimento inexistente ou futuro', () => {
    const schema = createReplaceOratorianoSchema({
      firstName: 'Ana',
      surname: 'Souza',
    })
    const base = {
      firstName: 'Ana',
      phoneNumber: '',
      reason: '',
      surname: 'Souza',
    }

    expect(schema.safeParse({
      ...base,
      birthDate: '2026-02-31',
    }).success).toBe(false)
    expect(schema.safeParse({
      ...base,
      birthDate: '2999-01-01',
    }).success).toBe(false)
  })

  it('exige motivo somente quando o nome muda', () => {
    const schema = createReplaceOratorianoSchema({
      firstName: 'Ana',
      surname: 'Souza',
    })
    const base = {
      birthDate: '',
      firstName: 'Ana',
      phoneNumber: '+55 19 99999-9999',
      reason: '',
      surname: 'Souza',
    }

    expect(schema.safeParse(base).success).toBe(true)
    expect(schema.safeParse({
      ...base,
      firstName: 'Anna',
    }).success).toBe(false)
    expect(schema.safeParse({
      ...base,
      firstName: 'Anna',
      reason: 'Correção do nome civil.',
    }).success).toBe(true)
  })

  it('normaliza e exige motivo de exclusão com até 2.000 caracteres Unicode', () => {
    expect(deleteOratorianoSchema.parse({
      reason: '  Cadastro duplicado.  ',
    })).toEqual({ reason: 'Cadastro duplicado.' })
    expect(deleteOratorianoSchema.safeParse({ reason: '   ' }).success)
      .toBe(false)
    expect(deleteOratorianoSchema.safeParse({
      reason: 'a'.repeat(2001),
    }).success).toBe(false)
    expect(deleteOratorianoSchema.safeParse({
      reason: '🙂'.repeat(2000),
    }).success).toBe(true)
  })
})
