import { describe, expect, it } from 'vitest'

import { toEventSearch } from './eventSearchConfig'

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
})
