import { describe, expect, it } from 'vitest'

import {
  InvalidOratorianoFormDataError,
  parseOratorianoFormDetail,
} from './parseFormDetail'

describe('parseOratorianoFormDetail', () => {
  it('estreita o conteúdo válido sem alterar os metadados', () => {
    const detail = {
      data: { firstName: 'Marina' },
      draftRevision: 4,
      status: 'DRAFT' as const,
    }

    expect(parseOratorianoFormDetail(detail)).toEqual(detail)
  })

  it('não inicializa conteúdo vazio quando data está ausente', () => {
    expect(() => parseOratorianoFormDetail({ status: 'DRAFT' }))
      .toThrow(InvalidOratorianoFormDataError)
  })

  it('não inclui detalhes de validação no erro público', () => {
    expect(() => parseOratorianoFormDetail({
      data: { health: { allergies: { answer: 'FUTURE' } } },
    })).toThrow('Invalid Oratoriano form data')
  })
})
