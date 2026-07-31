import { describe, expect, it } from 'vitest'

import { oratorianoFormDraftSchema } from './schemas/formDraftSchema'
import { fromFormDraftTransport, toFormDraftTransport } from './formDraftMapper'

const transportDraft = {
  address: {
    addressLine: 'Rua das Acácias',
    addressNumber: '120',
    cep: '01234567',
    city: 'São Paulo',
    neighborhood: 'Jardim Esperança',
  },
  birthDate: '2012-09-17',
  cpf: '11144477735',
  declarations: {
    formReviewed: true,
    imageAndVoiceAuthorizationAccepted: false,
  },
  firstName: 'Marina',
  health: {
    allergies: { answer: 'NO' as const },
    medicineUse: {
      answer: 'YES' as const,
      explanation: 'Uso acompanhado pela família.',
      importantInstructions: 'Seguir a orientação entregue.',
    },
  },
  mother: {
    cpf: '52998224725',
    firstName: 'Renata',
    surname: 'Alves',
  },
  responsible: {
    atLeast18: true,
    cpf: '52998224725',
    email: 'responsavel@example.test',
    firstName: 'Renata',
    phoneNumber: '+5511977773030',
    relationship: 'MOTHER' as const,
    surname: 'Alves',
  },
  signedOn: '2026-03-14',
  surname: 'Alves',
}

describe('mapeamento do rascunho', () => {
  it('converte ausências do transporte em controles estáveis', () => {
    const values = fromFormDraftTransport({})

    expect(values.firstName).toBe('')
    expect(values.address.cep).toBe('')
    expect(values.responsible.relationship).toBe('')
    expect(values.health.allergies).toEqual({
      answer: '',
      explanation: '',
      importantInstructions: '',
    })
    expect(values.declarations.formReviewed).toBeUndefined()
  })

  it('preserva todos os valores válidos recebidos', () => {
    const parsed = oratorianoFormDraftSchema.parse(transportDraft)
    const values = fromFormDraftTransport(parsed)

    expect(values).toMatchObject({
      address: { addressLine: 'Rua das Acácias', cep: '01234567' },
      firstName: 'Marina',
      health: {
        medicineUse: {
          answer: 'YES',
          explanation: 'Uso acompanhado pela família.',
        },
      },
      responsible: {
        atLeast18: 'true',
        relationship: 'MOTHER',
      },
    })
  })

  it('remove strings e objetos totalmente vazios', () => {
    const result = toFormDraftTransport(fromFormDraftTransport({}))

    expect(result).toEqual({})
    expect(result).not.toHaveProperty('address')
    expect(result).not.toHaveProperty('health')
    expect(result).not.toHaveProperty('responsible')
  })

  it('normaliza textos, CPF, CEP e e-mail no payload integral', () => {
    const values = fromFormDraftTransport({})
    values.firstName = '  Marina  '
    values.cpf = '111.444.777-35'
    values.address.cep = '01234-567'
    values.responsible.relationship = 'RELATIVE'
    values.responsible.relationshipComplement = '  Tia  '
    values.responsible.email = '  CONTATO@EXAMPLE.TEST  '
    values.phoneNumber = '(11) 98888-1212'
    values.responsible.phoneNumber = '+55 11 97777-3030'

    expect(toFormDraftTransport(values)).toMatchObject({
      address: { cep: '01234567' },
      cpf: '11144477735',
      firstName: 'Marina',
      phoneNumber: '+5511988881212',
      responsible: {
        email: 'contato@example.test',
        phoneNumber: '+5511977773030',
        relationship: 'RELATIVE',
        relationshipComplement: 'Tia',
      },
    })
  })

  it('deriva SELF da identificação sem duplicar uma fonte editável', () => {
    const values = fromFormDraftTransport({})
    values.firstName = 'Marina'
    values.surname = 'Alves'
    values.cpf = '11144477735'
    values.phoneNumber = '11988881212'
    values.responsible.relationship = 'SELF'
    values.responsible.firstName = 'Valor que não deve vencer'

    expect(toFormDraftTransport(values).responsible).toMatchObject({
      cpf: '11144477735',
      firstName: 'Marina',
      phoneNumber: '+5511988881212',
      relationship: 'SELF',
      surname: 'Alves',
    })
  })

  it.each([
    ['MOTHER', 'mother'],
    ['FATHER', 'father'],
  ] as const)('deriva %s no vínculo familiar correspondente', (relationship, parentKey) => {
    const values = fromFormDraftTransport({})
    values.responsible.relationship = relationship
    values.responsible.firstName = 'Renata'
    values.responsible.surname = 'Alves'
    values.responsible.cpf = '52998224725'

    const result = toFormDraftTransport(values)
    expect(result[parentKey]).toEqual({
      cpf: '52998224725',
      firstName: 'Renata',
      surname: 'Alves',
    })
  })

  it('faz round-trip sem perder dados de outras etapas', () => {
    const parsed = oratorianoFormDraftSchema.parse(transportDraft)
    const result = toFormDraftTransport(fromFormDraftTransport(parsed))

    expect(result).toEqual(parsed)
  })

  it('preserva instruções válidas de saúde fora do campo editável desta fatia', () => {
    const parsed = oratorianoFormDraftSchema.parse({
      health: {
        allergies: {
          answer: 'YES',
          explanation: 'Alergia sintética.',
          importantInstructions: 'Orientação recebida do responsável.',
        },
      },
    })

    expect(toFormDraftTransport(fromFormDraftTransport(parsed))).toEqual(parsed)
  })
})
