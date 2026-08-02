import { describe, expect, it } from 'vitest'

import { toOratorioSearch } from './oratorioSearch'

describe('adaptação da busca de Ocorrências', () => {
  it('mantém o tipo fixo e envia a data completa como intervalo', () => {
    const result = toOratorioSearch([
      { field: 'beginDate', value: '02/08/2026', comparisonMethod: 'LIKE' },
      { field: 'status', value: 'SCHEDULED', comparisonMethod: 'EQUALS' },
    ], [])

    expect(result).toEqual({
      eventSearch: {
        filters: {
          beginDateFrom: '2026-08-02T03:00:00.000Z',
          beginDateTo: '2026-08-03T02:59:59.999Z',
          title: '',
          status: 'SCHEDULED',
          type: 'ORATORIO',
        },
        sorts: [],
      },
      partialDateTerm: '',
    })
  })

  it('retém termos parciais fora da consulta enviada ao backend', () => {
    const result = toOratorioSearch([
      { field: 'beginDate', value: 'agos', comparisonMethod: 'LIKE' },
    ], [])

    expect(result).toEqual({
      eventSearch: {
        filters: { title: '', status: 'ALL', type: 'ORATORIO' },
        sorts: [],
      },
      partialDateTerm: 'agos',
    })
  })
})
