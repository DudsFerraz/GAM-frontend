import { describe, expect, it } from 'vitest'

import {
  matchesOratorioDateSearch,
  normalizeOratorioDateSearch,
  parseOratorioDateRange,
} from './dateSearch'

describe('busca por data de Oratório', () => {
  it('converte a data curta no intervalo do dia civil de São Paulo', () => {
    expect(parseOratorioDateRange('02/08/2026')).toEqual({
      from: '2026-08-02T03:00:00.000Z',
      to: '2026-08-03T02:59:59.999Z',
    })
  })

  it('aceita a data longa com acentos e capitalização diferentes', () => {
    expect(parseOratorioDateRange('  02 DE AGÔSTO DE 2026 ')).toEqual({
      from: '2026-08-02T03:00:00.000Z',
      to: '2026-08-03T02:59:59.999Z',
    })
  })

  it('rejeita datas completas inválidas sem transformar o termo em intervalo', () => {
    expect(parseOratorioDateRange('31/02/2026')).toBeNull()
    expect(parseOratorioDateRange('02 de luna de 2026')).toBeNull()
  })

  it('compara termos parciais com as versões longa e curta do card', () => {
    const beginDate = '2026-09-01T14:00:00.000Z'

    for (const term of [
      '01',
      'setembro',
      '2026',
      '01 de setembro',
      '01/09',
    ]) {
      expect(matchesOratorioDateSearch(beginDate, term)).toBe(true)
    }

    expect(matchesOratorioDateSearch(beginDate, 'agosto')).toBe(false)
  })

  it('normaliza espaços, acentos e maiúsculas para a comparação', () => {
    expect(normalizeOratorioDateSearch('  01 / 09  DE  2026 '))
      .toBe('01/09 de 2026')
  })
})
