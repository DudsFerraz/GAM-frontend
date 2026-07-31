import { describe, expect, it } from 'vitest'

import { fromFormDraftTransport } from '../formDraftMapper'
import {
  oratorianoFormDraftSchema,
  oratorianoFormCompletionSchema,
  oratorianoFormEditorSchema,
} from './formDraftSchema'

const completeDraft = {
  address: {
    addressLine: 'Rua das Acácias',
    addressNumber: '120',
    cep: '01234-567',
    city: 'São Paulo',
    neighborhood: 'Jardim Esperança',
  },
  birthDate: '2012-09-17',
  cpf: '11144477735',
  declarations: {
    formReviewed: true,
    healthInformationCurrentConfirmed: true,
    imageAndVoiceAuthorizationAccepted: false,
    informationTruthConfirmed: true,
    informationUseUnderstood: true,
    signerRelationshipConfirmed: true,
  },
  father: {
    cpf: '52998224725',
    firstName: 'Carlos',
    surname: 'Alves',
  },
  firstName: 'Marina',
  health: {
    allergies: { answer: 'NO' },
    convulsions: { answer: 'NO' },
    frequentFainting: { answer: 'NO' },
    heartCondition: { answer: 'NO' },
    medicalFollowUp: { answer: 'NO' },
    medicineUse: {
      answer: 'YES',
      explanation: 'Uso acompanhado pela família.',
      importantInstructions: 'Seguir a orientação entregue à coordenação.',
    },
    otherCare: 'Evitar exposição prolongada ao sol.',
    otherHealthCondition: { answer: 'NOT_INFORMED' },
    physicalActivityRestriction: { answer: 'NO' },
  },
  mother: {
    firstName: 'Renata',
    surname: 'Alves',
  },
  phoneNumber: '+55 11 98888-1212',
  responsible: {
    atLeast18: true,
    email: 'responsavel@example.test',
    firstName: 'Renata',
    phoneNumber: '+55 11 97777-3030',
    relationship: 'MOTHER',
    surname: 'Alves',
  },
  rg: '12.345.678-9',
  schoolGrade: '8º ano',
  schoolName: 'Escola Municipal Horizonte',
  signedOn: '2026-03-14',
  surname: 'Alves',
} as const

describe('oratorianoFormDraftSchema', () => {
  it('aceita um payload completo válido', () => {
    expect(oratorianoFormDraftSchema.safeParse(completeDraft).success)
      .toBe(true)
  })

  it('aceita um payload válido com campos opcionais ausentes', () => {
    expect(oratorianoFormDraftSchema.safeParse({
      firstName: 'Marina',
      health: { allergies: { answer: 'NOT_INFORMED' } },
    }).success).toBe(true)
    expect(oratorianoFormDraftSchema.safeParse({}).success).toBe(true)
  })

  it.each([
    null,
    [],
    { birthDate: '2026-02-30' },
    { cpf: '11111111111' },
    { cpf: 'abc11144477735xyz' },
    { rg: '<script>' },
    { phoneNumber: '-' },
    { phoneNumber: '1' },
    { phoneNumber: '()' },
    { phoneNumber: '+1 202 555 0123' },
    { signedOn: '31/07/2026' },
  ])('rejeita payload inválido %#', (payload) => {
    expect(oratorianoFormDraftSchema.safeParse(payload).success).toBe(false)
  })

  it.each([
    { address: { cep: '123' } },
    { declarations: { formReviewed: 'sim' } },
    { health: { allergies: { answer: 'FUTURE' } } },
    { responsible: { relationship: 'UNKNOWN' } },
    { health: { allergies: { answer: 'NO', diagnostic: 'privado' } } },
  ])('rejeita objeto aninhado incompatível %#', (payload) => {
    expect(oratorianoFormDraftSchema.safeParse(payload).success).toBe(false)
  })

  it('fornece mensagens explícitas em português para falhas alcançáveis', () => {
    const result = oratorianoFormDraftSchema.safeParse({
      birthDate: '2026-02-30',
      cpf: '11111111111',
      phoneNumber: '-',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual([
        'Data de nascimento deve ser uma data civil válida.',
        'Informe um CPF válido com onze dígitos.',
        'Informe um telefone brasileiro válido.',
      ])
    }
  })
})

describe('oratorianoFormEditorSchema', () => {
  it('permite rascunho parcial com controles vazios', () => {
    expect(oratorianoFormEditorSchema.safeParse(
      fromFormDraftTransport({}),
    ).success).toBe(true)
  })

  it('permite salvar incrementalmente valores válidos ainda incompletos', () => {
    const values = fromFormDraftTransport({})
    values.birthDate = '2012-09-17'
    values.signedOn = '2026-03-14'
    values.responsible.relationship = 'SELF'
    values.health.allergies.answer = 'YES'

    expect(oratorianoFormEditorSchema.safeParse(values).success).toBe(true)
    expect(oratorianoFormCompletionSchema.safeParse(values).success).toBe(false)
  })

  it('aplica regras de menor, escola e responsável adulto', () => {
    const values = fromFormDraftTransport({})
    values.birthDate = '2012-09-17'
    values.signedOn = '2026-03-14'
    values.responsible.relationship = 'SELF'
    values.responsible.atLeast18 = 'false'

    const result = oratorianoFormCompletionSchema.safeParse(values)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ message: 'Preencha este campo.', path: ['schoolName'] }),
        expect.objectContaining({
          message: 'Para menor de idade, selecione uma pessoa responsável adulta.',
          path: ['responsible', 'relationship'],
        }),
      ]))
    }
  })

  it('exige telefone do adulto quando o responsável é o próprio Oratoriano', () => {
    const values = fromFormDraftTransport({})
    values.birthDate = '1990-01-01'
    values.signedOn = '2026-03-14'
    values.responsible.relationship = 'SELF'

    const result = oratorianoFormCompletionSchema.safeParse(values)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({
        message: 'Informe o telefone do próprio Oratoriano.',
        path: ['phoneNumber'],
      }))
    }
  })

  it('valida responsável, vínculo familiar e explicação de saúde', () => {
    const values = fromFormDraftTransport({})
    values.responsible.relationship = 'RELATIVE'
    values.father.firstName = 'Carlos'
    values.health.allergies.answer = 'YES'

    const result = oratorianoFormCompletionSchema.safeParse(values)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({
          message: 'Explique a relação com a pessoa responsável.',
          path: ['responsible', 'relationshipComplement'],
        }),
        expect.objectContaining({ path: ['father', 'surname'] }),
        expect.objectContaining({
          message: 'Explique a resposta afirmativa.',
          path: ['health', 'allergies', 'explanation'],
        }),
      ]))
    }
  })

  it('rejeita CEP, telefone, e-mail e datas impossíveis sem defaults técnicos', () => {
    const values = fromFormDraftTransport({})
    values.address.cep = '123'
    values.birthDate = '2026-02-30'
    values.phoneNumber = '1'
    values.responsible.email = 'invalido'

    const result = oratorianoFormEditorSchema.safeParse(values)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual([
        'Informe uma data civil válida.',
        'Informe um telefone brasileiro válido.',
        'Informe um CEP válido com oito dígitos.',
        'Informe um e-mail válido.',
      ])
      expect(result.error.issues.every((issue) => issue.message.length > 0))
        .toBe(true)
    }
  })
})
