import { z } from 'zod'

import type { OratorianoFormDraft } from '../types'

const NAME_PATTERN = /^\p{L}+(?:[ '-]\p{L}+)*$/u
const PHONE_PATTERN = /^\+?[\d\s().-]+$/
const RG_PATTERN = /^[\p{L}\d./-]+$/u

function isValidLocalDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
}

function isValidCpf(value: string): boolean {
  if (!/^\d{11}$/.test(value) || /^(\d)\1{10}$/.test(value)) return false

  const digits = value

  const calculateDigit = (length: number) => {
    const sum = digits
      .slice(0, length)
      .split('')
      .reduce((total, digit, index) => (
        total + Number(digit) * (length + 1 - index)
      ), 0)
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  return calculateDigit(9) === Number(digits[9])
    && calculateDigit(10) === Number(digits[10])
}

function isValidPhoneNumber(value: string): boolean {
  if (!PHONE_PATTERN.test(value)) return false

  const digits = value.replace(/\D/g, '')
  return value.startsWith('+')
    ? digits.length >= 8 && digits.length <= 15 && digits[0] !== '0'
    : digits.length === 10 || digits.length === 11
}

function optionalText(maxLength: number) {
  return z.string().trim().min(1).max(maxLength).optional()
}

const nameSchema = (maxLength: number) => z.string()
  .trim()
  .min(1)
  .max(maxLength)
  .refine((value) => NAME_PATTERN.test(value))

const localDateSchema = z.string().refine(isValidLocalDate)
const cpfSchema = z.string().refine(isValidCpf)
const phoneSchema = z.string()
  .trim()
  .min(1)
  .max(32)
  .refine(isValidPhoneNumber)

const addressSchema = z.object({
  addressLine: optionalText(200),
  addressNumber: optionalText(32),
  neighborhood: optionalText(100),
  cep: z.string().regex(/^\d{5}-?\d{3}$/).optional(),
  city: optionalText(100),
}).strict()

const responsibleSchema = z.object({
  relationship: z.enum([
    'SELF',
    'MOTHER',
    'FATHER',
    'RELATIVE',
    'REFERENCE_ADULT',
  ]).optional(),
  relationshipComplement: optionalText(120),
  firstName: nameSchema(32).optional(),
  surname: nameSchema(64).optional(),
  cpf: cpfSchema.optional(),
  phoneNumber: phoneSchema.optional(),
  email: z.email().max(254).optional(),
  atLeast18: z.boolean().optional(),
}).strict()

const parentSchema = z.object({
  firstName: nameSchema(32).optional(),
  surname: nameSchema(64).optional(),
  cpf: cpfSchema.optional(),
}).strict()

const healthQuestionSchema = z.object({
  answer: z.enum(['YES', 'NO', 'NOT_INFORMED']).optional(),
  explanation: optionalText(2000),
  importantInstructions: optionalText(2000),
}).strict()

const healthSchema = z.object({
  medicalFollowUp: healthQuestionSchema.optional(),
  physicalActivityRestriction: healthQuestionSchema.optional(),
  medicineUse: healthQuestionSchema.optional(),
  allergies: healthQuestionSchema.optional(),
  convulsions: healthQuestionSchema.optional(),
  frequentFainting: healthQuestionSchema.optional(),
  heartCondition: healthQuestionSchema.optional(),
  otherHealthCondition: healthQuestionSchema.optional(),
  otherCare: optionalText(5000),
}).strict()

const declarationsSchema = z.object({
  signerRelationshipConfirmed: z.boolean().optional(),
  informationTruthConfirmed: z.boolean().optional(),
  healthInformationCurrentConfirmed: z.boolean().optional(),
  informationUseUnderstood: z.boolean().optional(),
  formReviewed: z.boolean().optional(),
  imageAndVoiceAuthorizationAccepted: z.boolean().optional(),
}).strict()

export const oratorianoFormDraftSchema = z.object({
  firstName: nameSchema(32).optional(),
  surname: nameSchema(64).optional(),
  birthDate: localDateSchema.optional(),
  cpf: cpfSchema.optional(),
  rg: z.string().trim().min(1).max(20).regex(RG_PATTERN).optional(),
  address: addressSchema.optional(),
  phoneNumber: phoneSchema.optional(),
  schoolName: optionalText(200),
  schoolGrade: optionalText(100),
  responsible: responsibleSchema.optional(),
  father: parentSchema.optional(),
  mother: parentSchema.optional(),
  health: healthSchema.optional(),
  declarations: declarationsSchema.optional(),
  signedOn: localDateSchema.optional(),
}).strict() satisfies z.ZodType<OratorianoFormDraft>

export type ParsedOratorianoFormDraft = z.output<
  typeof oratorianoFormDraftSchema
>
