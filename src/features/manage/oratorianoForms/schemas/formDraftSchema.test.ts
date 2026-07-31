import { describe, expect, it } from 'vitest'

import { oratorianoFormDraftSchema } from './formDraftSchema'

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
})
