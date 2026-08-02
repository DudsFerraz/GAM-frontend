import { describe, expect, it } from 'vitest'

import { fromFormDraftTransport } from './formDraftMapper'
import {
  getOratorianoFormStepStatuses,
  type OratorianoFormStepDefinition,
} from './stepStatus'
import type { OratorianoFormValues } from './schemas/formDraftSchema'

const steps: ReadonlyArray<OratorianoFormStepDefinition> = [
  { fields: ['cpf'] },
  {
    fields: [
      'schoolName',
      'responsible.relationship',
      'responsible.relationshipComplement',
      'responsible.email',
    ],
  },
  { fields: ['health.allergies.answer'] },
  { fields: ['declarations.formReviewed', 'signedOn'] },
  { fields: [] },
]

function getValues(): OratorianoFormValues {
  return fromFormDraftTransport({})
}

function fillRequiredIdentification(values: OratorianoFormValues) {
  values.firstName = 'Marina'
  values.surname = 'Alves'
  values.birthDate = '2005-03-05'
  values.cpf = '52998224725'
  values.phoneNumber = '11988881212'
  values.address.addressLine = 'Rua das Acácias'
  values.address.addressNumber = '120'
  values.address.neighborhood = 'Centro'
  values.address.cep = '01234-567'
  values.address.city = 'São Paulo'
}

describe('status das etapas da ficha adicional', () => {
  it('marca uma etapa vazia como pendente e agrega a revisão', () => {
    expect(getOratorianoFormStepStatuses(getValues(), steps)).toEqual([
      'incomplete',
      'incomplete',
      'incomplete',
      'incomplete',
      'incomplete',
    ])
  })

  it('marca valor preenchido inválido como inválido', () => {
    const values = getValues()
    values.cpf = '12345678910'

    expect(getOratorianoFormStepStatuses(values, steps)).toEqual([
      'invalid',
      'incomplete',
      'incomplete',
      'incomplete',
      'invalid',
    ])
  })

  it('mantém verde uma etapa preenchida sem falhas de conclusão', () => {
    const values = getValues()
    fillRequiredIdentification(values)

    expect(getOratorianoFormStepStatuses(values, steps)[0]).toBe('complete')
    expect(getOratorianoFormStepStatuses(values, steps)[4]).toBe('incomplete')
  })

  it('prioriza valor inválido quando a etapa também tem pendência', () => {
    const values = getValues()
    values.responsible.relationship = 'RELATIVE'
    values.responsible.email = 'invalido'
    values.cpf = '12345678910'

    expect(getOratorianoFormStepStatuses(values, steps)[0]).toBe('invalid')
    expect(getOratorianoFormStepStatuses(values, steps)[1]).toBe('invalid')
    expect(getOratorianoFormStepStatuses(values, steps)[4]).toBe('invalid')
  })
})
