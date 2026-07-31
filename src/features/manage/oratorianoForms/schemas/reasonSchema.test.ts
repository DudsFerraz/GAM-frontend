import { describe, expect, it } from 'vitest'

import { oratorianoFormReasonSchema } from './reasonSchema'

describe('oratorianoFormReasonSchema', () => {
  it('exige um motivo significativo e normaliza espaços externos', () => {
    expect(oratorianoFormReasonSchema.parse({ reason: '  Motivo válido.  ' }))
      .toEqual({ reason: 'Motivo válido.' })
    expect(oratorianoFormReasonSchema.safeParse({ reason: '' })).toMatchObject({
      success: false,
    })
    expect(oratorianoFormReasonSchema.safeParse({ reason: '   ' })).toMatchObject({
      success: false,
    })
  })

  it('aceita até 2.000 pontos de código Unicode', () => {
    expect(oratorianoFormReasonSchema.safeParse({ reason: 'a'.repeat(2000) }).success)
      .toBe(true)
    expect(oratorianoFormReasonSchema.safeParse({ reason: 'a'.repeat(2001) }).success)
      .toBe(false)
    expect(oratorianoFormReasonSchema.safeParse({ reason: '😀'.repeat(2000) }).success)
      .toBe(true)
    expect(oratorianoFormReasonSchema.safeParse({ reason: '😀'.repeat(2001) }).success)
      .toBe(false)
  })

  it('fornece mensagens explícitas em português', () => {
    const empty = oratorianoFormReasonSchema.safeParse({ reason: '   ' })
    const tooLong = oratorianoFormReasonSchema.safeParse({
      reason: 'a'.repeat(2001),
    })

    expect(empty.success).toBe(false)
    expect(!empty.success && empty.error.issues[0]?.message)
      .toBe('Informe o motivo da exclusão.')
    expect(tooLong.success).toBe(false)
    expect(!tooLong.success && tooLong.error.issues[0]?.message)
      .toBe('O motivo deve ter no máximo 2.000 caracteres.')
  })
})
