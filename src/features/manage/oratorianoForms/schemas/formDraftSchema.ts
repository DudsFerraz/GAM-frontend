import { z } from 'zod'

import type { OratorianoFormDraft } from '../types'

const NAME_PATTERN = /^\p{L}+(?:[ '-]\p{L}+)*$/u
const PHONE_PATTERN = /^\+?[\d\s().-]+$/
const RG_PATTERN = /^[\p{L}\d./-]+$/u

const REQUIRED_TEXT = 'Preencha este campo.'

export function isValidLocalDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
}

export function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false

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

export function isValidPhoneNumber(value: string): boolean {
  if (!PHONE_PATTERN.test(value)) return false

  const digits = value.replace(/\D/g, '')
  if (value.startsWith('+')) {
    const nationalNumber = digits.slice(2)
    return digits.startsWith('55')
      && (nationalNumber.length === 10 || nationalNumber.length === 11)
  }
  return digits.length === 10 || digits.length === 11
}

function optionalTransportText(maxLength: number, label: string) {
  return z.string({ error: `${label} deve ser um texto.` })
    .trim()
    .min(1, `${label} não pode ficar em branco.`)
    .max(maxLength, `${label} deve ter no máximo ${maxLength} caracteres.`)
    .optional()
}

const transportNameSchema = (maxLength: number, label: string) => z.string({
  error: `${label} deve ser um texto.`,
})
  .trim()
  .min(1, `${label} não pode ficar em branco.`)
  .max(maxLength, `${label} deve ter no máximo ${maxLength} caracteres.`)
  .refine(
    (value) => NAME_PATTERN.test(value),
    `${label} deve conter somente letras, espaços, apóstrofo ou hífen.`,
  )

const transportLocalDateSchema = (label: string) => z.string({
  error: `${label} deve ser uma data.`,
}).refine(isValidLocalDate, `${label} deve ser uma data civil válida.`)

const transportCpfSchema = z.string({ error: 'CPF deve ser um texto.' })
  .regex(/^\d{11}$/, 'CPF deve conter exatamente onze dígitos.')
  .refine(isValidCpf, 'Informe um CPF válido com onze dígitos.')

const transportPhoneSchema = z.string({ error: 'Telefone deve ser um texto.' })
  .trim()
  .min(1, 'Telefone não pode ficar em branco.')
  .max(32, 'Telefone deve ter no máximo 32 caracteres.')
  .refine(isValidPhoneNumber, 'Informe um telefone brasileiro válido.')

const addressTransportSchema = z.object({
  addressLine: optionalTransportText(200, 'Logradouro'),
  addressNumber: optionalTransportText(32, 'Número'),
  neighborhood: optionalTransportText(100, 'Bairro'),
  cep: z.string({ error: 'CEP deve ser um texto.' })
    .regex(/^\d{5}-?\d{3}$/, 'Informe um CEP válido com oito dígitos.')
    .optional(),
  city: optionalTransportText(100, 'Cidade'),
}, { error: 'Endereço deve ser um objeto válido.' }).strict()

const responsibleTransportSchema = z.object({
  relationship: z.enum([
    'SELF',
    'MOTHER',
    'FATHER',
    'RELATIVE',
    'REFERENCE_ADULT',
  ], { error: 'Relação do responsável não reconhecida.' }).optional(),
  relationshipComplement: optionalTransportText(120, 'Complemento da relação'),
  firstName: transportNameSchema(32, 'Nome do responsável').optional(),
  surname: transportNameSchema(64, 'Sobrenome do responsável').optional(),
  cpf: transportCpfSchema.optional(),
  phoneNumber: transportPhoneSchema.optional(),
  email: z.email('Informe um e-mail válido.')
    .max(254, 'E-mail deve ter no máximo 254 caracteres.')
    .optional(),
  atLeast18: z.boolean({ error: 'A maioridade do responsável deve ser confirmada.' }).optional(),
}, { error: 'Responsável deve ser um objeto válido.' }).strict()

const parentTransportSchema = z.object({
  firstName: transportNameSchema(32, 'Nome do familiar').optional(),
  surname: transportNameSchema(64, 'Sobrenome do familiar').optional(),
  cpf: transportCpfSchema.optional(),
}, { error: 'Familiar deve ser um objeto válido.' }).strict()

const healthQuestionTransportSchema = z.object({
  answer: z.enum(['YES', 'NO', 'NOT_INFORMED'], {
    error: 'Resposta de saúde não reconhecida.',
  }).optional(),
  explanation: optionalTransportText(2000, 'Explicação de saúde'),
  importantInstructions: optionalTransportText(2000, 'Orientação importante'),
}, { error: 'Resposta de saúde deve ser um objeto válido.' }).strict()

const healthTransportSchema = z.object({
  medicalFollowUp: healthQuestionTransportSchema.optional(),
  physicalActivityRestriction: healthQuestionTransportSchema.optional(),
  medicineUse: healthQuestionTransportSchema.optional(),
  allergies: healthQuestionTransportSchema.optional(),
  convulsions: healthQuestionTransportSchema.optional(),
  frequentFainting: healthQuestionTransportSchema.optional(),
  heartCondition: healthQuestionTransportSchema.optional(),
  otherHealthCondition: healthQuestionTransportSchema.optional(),
  otherCare: optionalTransportText(5000, 'Outros cuidados'),
}, { error: 'Informações de saúde devem formar um objeto válido.' }).strict()

const declarationsTransportSchema = z.object({
  signerRelationshipConfirmed: z.boolean({ error: 'A confirmação deve ser verdadeira ou falsa.' }).optional(),
  informationTruthConfirmed: z.boolean({ error: 'A confirmação deve ser verdadeira ou falsa.' }).optional(),
  healthInformationCurrentConfirmed: z.boolean({ error: 'A confirmação deve ser verdadeira ou falsa.' }).optional(),
  informationUseUnderstood: z.boolean({ error: 'A confirmação deve ser verdadeira ou falsa.' }).optional(),
  formReviewed: z.boolean({ error: 'A confirmação deve ser verdadeira ou falsa.' }).optional(),
  imageAndVoiceAuthorizationAccepted: z.boolean({ error: 'A autorização deve ser verdadeira ou falsa.' }).optional(),
}, { error: 'Declarações devem formar um objeto válido.' }).strict()

export const oratorianoFormDraftSchema = z.object({
  firstName: transportNameSchema(32, 'Nome').optional(),
  surname: transportNameSchema(64, 'Sobrenome').optional(),
  birthDate: transportLocalDateSchema('Data de nascimento').optional(),
  cpf: transportCpfSchema.optional(),
  rg: z.string({ error: 'RG deve ser um texto.' })
    .trim()
    .min(1, 'RG não pode ficar em branco.')
    .max(20, 'RG deve ter no máximo 20 caracteres.')
    .regex(RG_PATTERN, 'RG contém caracteres não permitidos.')
    .optional(),
  address: addressTransportSchema.optional(),
  phoneNumber: transportPhoneSchema.optional(),
  schoolName: optionalTransportText(200, 'Escola'),
  schoolGrade: optionalTransportText(100, 'Ano escolar'),
  responsible: responsibleTransportSchema.optional(),
  father: parentTransportSchema.optional(),
  mother: parentTransportSchema.optional(),
  health: healthTransportSchema.optional(),
  declarations: declarationsTransportSchema.optional(),
  signedOn: transportLocalDateSchema('Data de assinatura').optional(),
}, { error: 'Os dados da ficha devem formar um objeto válido.' }).strict() satisfies z.ZodType<OratorianoFormDraft>

const optionalEditorText = (
  maxLength: number,
  message: string,
  validator?: (value: string) => boolean,
) => z.string()
  .max(maxLength, `Use no máximo ${maxLength} caracteres.`)
  .refine((value) => !value.trim() || !validator || validator(value.trim()), message)

const editorNameSchema = (maxLength: number) => optionalEditorText(
  maxLength,
  'Use somente letras, espaços, apóstrofo ou hífen.',
  (value) => NAME_PATTERN.test(value),
)
const editorDateSchema = optionalEditorText(
  10,
  'Informe uma data civil válida.',
  isValidLocalDate,
)
const editorCpfSchema = optionalEditorText(
  18,
  'Informe um CPF válido com onze dígitos.',
  isValidCpf,
)
const editorPhoneSchema = optionalEditorText(
  32,
  'Informe um telefone brasileiro válido.',
  isValidPhoneNumber,
)
const editorHealthQuestionSchema = z.object({
  answer: z.enum(['', 'YES', 'NO', 'NOT_INFORMED'], {
    error: 'Selecione uma resposta válida.',
  }),
  explanation: z.string().max(2000, 'Use no máximo 2.000 caracteres.'),
  importantInstructions: z.string().max(2000, 'Use no máximo 2.000 caracteres.'),
})

export const oratorianoFormEditorSchema = z.object({
  firstName: editorNameSchema(32),
  surname: editorNameSchema(64),
  birthDate: editorDateSchema,
  cpf: editorCpfSchema,
  rg: optionalEditorText(
    20,
    'Use somente letras, números, ponto, barra ou hífen.',
    (value) => RG_PATTERN.test(value),
  ),
  phoneNumber: editorPhoneSchema,
  address: z.object({
    addressLine: z.string().max(200, 'Use no máximo 200 caracteres.'),
    addressNumber: z.string().max(32, 'Use no máximo 32 caracteres.'),
    neighborhood: z.string().max(100, 'Use no máximo 100 caracteres.'),
    cep: optionalEditorText(
      9,
      'Informe um CEP válido com oito dígitos.',
      (value) => /^\d{5}-?\d{3}$/.test(value),
    ),
    city: z.string().max(100, 'Use no máximo 100 caracteres.'),
  }),
  schoolName: z.string().max(200, 'Use no máximo 200 caracteres.'),
  schoolGrade: z.string().max(100, 'Use no máximo 100 caracteres.'),
  responsible: z.object({
    relationship: z.enum([
      '',
      'SELF',
      'MOTHER',
      'FATHER',
      'RELATIVE',
      'REFERENCE_ADULT',
    ], { error: 'Selecione uma relação válida.' }),
    relationshipComplement: z.string().max(120, 'Use no máximo 120 caracteres.'),
    firstName: editorNameSchema(32),
    surname: editorNameSchema(64),
    cpf: editorCpfSchema,
    phoneNumber: editorPhoneSchema,
    email: z.string().max(254, 'Use no máximo 254 caracteres.').refine(
      (value) => !value.trim() || z.email().safeParse(value.trim()).success,
      'Informe um e-mail válido.',
    ),
    atLeast18: z.enum(['', 'true', 'false'], {
      error: 'Selecione uma resposta válida.',
    }),
  }),
  father: z.object({
    firstName: editorNameSchema(32),
    surname: editorNameSchema(64),
    cpf: editorCpfSchema,
  }),
  mother: z.object({
    firstName: editorNameSchema(32),
    surname: editorNameSchema(64),
    cpf: editorCpfSchema,
  }),
  health: z.object({
    medicalFollowUp: editorHealthQuestionSchema,
    physicalActivityRestriction: editorHealthQuestionSchema,
    medicineUse: editorHealthQuestionSchema,
    allergies: editorHealthQuestionSchema,
    convulsions: editorHealthQuestionSchema,
    frequentFainting: editorHealthQuestionSchema,
    heartCondition: editorHealthQuestionSchema,
    otherHealthCondition: editorHealthQuestionSchema,
    otherCare: z.string().max(5000, 'Use no máximo 5.000 caracteres.'),
  }),
  declarations: z.object({
    signerRelationshipConfirmed: z.boolean().optional(),
    informationTruthConfirmed: z.boolean().optional(),
    healthInformationCurrentConfirmed: z.boolean().optional(),
    informationUseUnderstood: z.boolean().optional(),
    formReviewed: z.boolean().optional(),
    imageAndVoiceAuthorizationAccepted: z.boolean().optional(),
  }),
  signedOn: editorDateSchema,
})

export const oratorianoFormCompletionSchema = oratorianoFormEditorSchema
  .superRefine((values, context) => {
  const requiredTextFields = [
    ['firstName', values.firstName],
    ['surname', values.surname],
    ['birthDate', values.birthDate],
    ['cpf', values.cpf],
    ['address.addressLine', values.address.addressLine],
    ['address.addressNumber', values.address.addressNumber],
    ['address.neighborhood', values.address.neighborhood],
    ['address.cep', values.address.cep],
    ['address.city', values.address.city],
    ['phoneNumber', values.phoneNumber],
    ['signedOn', values.signedOn],
  ] as const
  for (const [path, value] of requiredTextFields) {
    if (!value.trim()) {
      context.addIssue({ code: 'custom', message: REQUIRED_TEXT, path: path.split('.') })
    }
  }

  const healthQuestionKeys = [
    'medicalFollowUp',
    'physicalActivityRestriction',
    'medicineUse',
    'allergies',
    'convulsions',
    'frequentFainting',
    'heartCondition',
    'otherHealthCondition',
  ] as const
  for (const key of healthQuestionKeys) {
    if (!values.health[key].answer) {
      context.addIssue({
        code: 'custom',
        message: REQUIRED_TEXT,
        path: ['health', key, 'answer'],
      })
    }
  }

  const declarationKeys = [
    'signerRelationshipConfirmed',
    'informationTruthConfirmed',
    'healthInformationCurrentConfirmed',
    'informationUseUnderstood',
    'formReviewed',
    'imageAndVoiceAuthorizationAccepted',
  ] as const
  for (const key of declarationKeys) {
    if (values.declarations[key] !== true) {
      context.addIssue({
        code: 'custom',
        message: 'Confirme este campo para concluir a ficha.',
        path: ['declarations', key],
      })
    }
  }

  const relationship = values.responsible.relationship
  const complementRequired = relationship === 'RELATIVE'
    || relationship === 'REFERENCE_ADULT'
  if (complementRequired && !values.responsible.relationshipComplement.trim()) {
    context.addIssue({
      code: 'custom',
      message: 'Explique a relação com a pessoa responsável.',
      path: ['responsible', 'relationshipComplement'],
    })
  }
  if (!complementRequired && values.responsible.relationshipComplement.trim()) {
    context.addIssue({
      code: 'custom',
      message: 'Este complemento não se aplica à relação selecionada.',
      path: ['responsible', 'relationshipComplement'],
    })
  }

  validateParent(values.father, 'father', context)
  validateParent(values.mother, 'mother', context)

  for (const key of healthQuestionKeys) {
    const question = values.health[key]
    if (question.answer === 'YES' && !question.explanation.trim()) {
      context.addIssue({
        code: 'custom',
        message: 'Explique a resposta afirmativa.',
        path: ['health', key, 'explanation'],
      })
    }
    if (question.answer !== 'YES' && question.explanation.trim()) {
      context.addIssue({
        code: 'custom',
        message: 'A explicação só deve ser preenchida para uma resposta afirmativa.',
        path: ['health', key, 'explanation'],
      })
    }
    if (key === 'medicineUse'
      && question.answer !== 'YES'
      && question.importantInstructions.trim()) {
      context.addIssue({
        code: 'custom',
        message: 'Informe orientações somente quando houver uso de medicamento.',
        path: ['health', key, 'importantInstructions'],
      })
    }
  }

  if (values.birthDate && values.signedOn) {
    const age = getAgeOnDate(values.birthDate, values.signedOn)
    if (age !== undefined && age < 18) {
      if (!values.schoolName.trim()) {
        context.addIssue({ code: 'custom', message: REQUIRED_TEXT, path: ['schoolName'] })
      }
      if (!values.schoolGrade.trim()) {
        context.addIssue({ code: 'custom', message: REQUIRED_TEXT, path: ['schoolGrade'] })
      }
      if (relationship === 'SELF') {
        context.addIssue({
          code: 'custom',
          message: 'Para menor de idade, selecione uma pessoa responsável adulta.',
          path: ['responsible', 'relationship'],
        })
      }
      if (relationship && values.responsible.atLeast18 !== 'true') {
        context.addIssue({
          code: 'custom',
          message: 'Confirme que a pessoa responsável tem 18 anos ou mais.',
          path: ['responsible', 'atLeast18'],
        })
      }
    }
    if (age !== undefined
      && age >= 18
      && relationship === 'SELF'
      && !values.phoneNumber.trim()) {
      context.addIssue({
        code: 'custom',
        message: 'Informe o telefone do próprio Oratoriano.',
        path: ['phoneNumber'],
      })
    }
  }
})

function validateParent(
  parent: { cpf: string; firstName: string; surname: string },
  key: 'father' | 'mother',
  context: z.RefinementCtx,
) {
  const hasValue = Object.values(parent).some((value) => value.trim())
  if (!hasValue) return

  if (!parent.firstName.trim()) {
    context.addIssue({ code: 'custom', message: REQUIRED_TEXT, path: [key, 'firstName'] })
  }
  if (!parent.surname.trim()) {
    context.addIssue({ code: 'custom', message: REQUIRED_TEXT, path: [key, 'surname'] })
  }
  if (!parent.cpf.trim()) {
    context.addIssue({ code: 'custom', message: REQUIRED_TEXT, path: [key, 'cpf'] })
  }
}

function getAgeOnDate(birthDate: string, signedOn: string): number | undefined {
  if (!isValidLocalDate(birthDate) || !isValidLocalDate(signedOn)) return undefined
  const [birthYear, birthMonth, birthDay] = birthDate.split('-').map(Number)
  const [signedYear, signedMonth, signedDay] = signedOn.split('-').map(Number)
  let age = signedYear - birthYear
  if (signedMonth < birthMonth
    || (signedMonth === birthMonth && signedDay < birthDay)) {
    age -= 1
  }
  return age
}

export function isMinorAtSignedDate(
  birthDate: string,
  signedOn: string,
): boolean {
  const age = getAgeOnDate(birthDate, signedOn)
  return age !== undefined && age < 18
}

export type OratorianoFormValues = z.input<typeof oratorianoFormEditorSchema>

export type ParsedOratorianoFormDraft = z.output<
  typeof oratorianoFormDraftSchema
>
