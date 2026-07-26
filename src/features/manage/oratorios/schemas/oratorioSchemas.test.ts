import { describe, expect, it } from 'vitest'

import {
  createOratorioSchema,
  oratorioPlanningSchema,
  oratorioReasonSchema,
} from './oratorioSchemas'

describe('schemas de Oratório', () => {
  it('aceita uma data real e rejeita data normalizada pelo JavaScript', () => {
    expect(createOratorioSchema.safeParse({ date: '2026-08-02' }).success)
      .toBe(true)
    expect(createOratorioSchema.safeParse({ date: '2026-02-31' }).success)
      .toBe(false)
  })

  it('aceita o planejamento vazio e limita cada texto', () => {
    expect(oratorioPlanningSchema.safeParse({
      boaTardeCriancasPlan: '',
      boaTardeJovensPlan: '',
      gincanaDescription: '',
      lancheDescription: '',
    }).success).toBe(true)
    expect(oratorioPlanningSchema.safeParse({
      boaTardeCriancasPlan: '',
      boaTardeJovensPlan: '',
      gincanaDescription: '',
      lancheDescription: 'a'.repeat(10001),
    }).success).toBe(false)
  })

  it('não aceita motivo vazio', () => {
    expect(oratorioReasonSchema.safeParse({ reason: '  ' }).success)
      .toBe(false)
  })
})
