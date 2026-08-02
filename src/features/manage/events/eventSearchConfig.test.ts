import { describe, expect, it } from 'vitest'

import {
  ORATORIO_SEARCH_CONFIG,
  toEventSearch,
} from './eventSearchConfig'

describe('configuração da busca de eventos', () => {
  it('mantém o tipo fixo de Ocorrências e converte filtros da interface', () => {
    expect(toEventSearch([
      { field: 'title', value: 'Encontro', comparisonMethod: 'LIKE' },
      { field: 'status', value: 'SCHEDULED', comparisonMethod: 'EQUALS' },
    ], [
      { field: 'beginDate', direction: 'DESC' },
    ], 'ORATORIO')).toEqual({
      filters: {
        title: 'Encontro',
        status: 'SCHEDULED',
        type: 'ORATORIO',
      },
      sorts: ['beginDate,desc'],
    })
  })

  it('ignora valores de tipo desconhecidos antes da borda da API', () => {
    expect(toEventSearch([
      { field: 'type', value: 'UNKNOWN', comparisonMethod: 'EQUALS' },
    ], [])).toEqual({
      filters: {
        title: '',
        status: 'ALL',
        type: 'ALL',
      },
      sorts: [],
    })
  })

  it('apresenta a data como pesquisa principal de Ocorrências', () => {
    expect(ORATORIO_SEARCH_CONFIG.find((field) => field.key === 'beginDate'))
      .toMatchObject({ label: 'Data' })
  })
})
