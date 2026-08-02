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

  it('trata campos vazios retornados pelo servidor como ausentes', () => {
    const detail = {
      data: {
        address: {
          addressLine: 'Rua das Flores',
          addressNumber: '91',
          cep: null,
          city: '',
          neighborhood: null,
        },
        birthDate: '2007-12-13',
        cpf: '52998224725',
        firstName: 'Beatriz',
        health: null,
        phoneNumber: '+5599999999999',
        schoolName: '',
        surname: 'Moraes',
      },
      draftRevision: 5,
      status: 'DRAFT' as const,
    }

    expect(parseOratorianoFormDetail(detail)).toEqual({
      ...detail,
      data: {
        address: {
          addressLine: 'Rua das Flores',
          addressNumber: '91',
        },
        birthDate: '2007-12-13',
        cpf: '52998224725',
        firstName: 'Beatriz',
        phoneNumber: '+5599999999999',
        surname: 'Moraes',
      },
    })
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
