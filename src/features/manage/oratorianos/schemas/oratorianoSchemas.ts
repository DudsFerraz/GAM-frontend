import { z } from 'zod'

import { canonicalizeNameSeparators } from '../name'

const NAME_PATTERN = /^\p{L}+(?:[ '-]\p{L}+)*$/u
const PHONE_PATTERN = /^\+?[\d\s().-]+$/

function isValidLocalDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
}

function countLetters(value: string): number {
  return [...value].filter((character) => /\p{L}/u.test(character)).length
}

function createNameComponentSchema(
  fieldLabel: string,
  maxLength: number,
) {
  return z
    .string()
    .min(1, `Informe ${fieldLabel}.`)
    .max(
      maxLength,
      `${fieldLabel === 'o nome' ? 'O nome' : 'O sobrenome'} deve ter no máximo ${maxLength} caracteres.`,
    )
    .refine(
      (value) => value === value.trim(),
      'Remova espaços antes ou depois do nome.',
    )
    .transform(canonicalizeNameSeparators)
    .refine(
      (value) => countLetters(value) >= 2,
      'Informe pelo menos duas letras.',
    )
    .refine(
      (value) => NAME_PATTERN.test(value),
      'Use apenas letras e separadores simples entre as partes do nome.',
    )
}

export const oratorianoNameSchema = z.object({
  firstName: createNameComponentSchema('o nome', 32),
  surname: createNameComponentSchema('o sobrenome', 64),
})

const optionalBirthDateSchema = z
  .string()
  .refine(
    (value) => value === '' || isValidLocalDate(value),
    'Informe uma data válida.',
  )
  .refine(
    (value) => {
      if (!value) return true

      const parts = new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: '2-digit',
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
      }).formatToParts(new Date())
      const part = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((item) => item.type === type)?.value ?? ''
      const today = `${part('year')}-${part('month')}-${part('day')}`
      return value <= today
    },
    'A data de nascimento não pode estar no futuro.',
  )

const optionalPhoneSchema = z
  .string()
  .transform((value) => value.trim())
  .refine(
    (value) => value === '' || value.length <= 32,
    'O telefone deve ter no máximo 32 caracteres.',
  )
  .refine(
    (value) => value === '' || PHONE_PATTERN.test(value),
    'Informe um telefone brasileiro ou um número internacional com DDI.',
  )

const optionalReasonSchema = z
  .string()
  .transform((value) => value.trim())
  .refine(
    (value) => value.length <= 2000,
    'O motivo deve ter no máximo 2.000 caracteres.',
  )

export const registerOratorianoSchema = oratorianoNameSchema

export const deleteOratorianoSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Informe o motivo da exclusão.')
    .refine(
      (reason) => Array.from(reason).length <= 2000,
      'O motivo deve ter no máximo 2.000 caracteres.',
    ),
})

export function createReplaceOratorianoSchema(current: {
  firstName?: string | null
  surname?: string | null
}) {
  return oratorianoNameSchema.extend({
    birthDate: optionalBirthDateSchema,
    phoneNumber: optionalPhoneSchema,
    reason: optionalReasonSchema,
  }).superRefine((values, context) => {
    const nameChanged =
      values.firstName !== canonicalizeNameSeparators(current.firstName ?? '')
      || values.surname !== canonicalizeNameSeparators(current.surname ?? '')

    if (nameChanged && !values.reason) {
      context.addIssue({
        code: 'custom',
        message: 'Informe o motivo da correção do nome.',
        path: ['reason'],
      })
    }
  })
}

export type RegisterOratorianoFormValues =
  z.infer<typeof registerOratorianoSchema>
export type ReplaceOratorianoFormValues = z.input<
  ReturnType<typeof createReplaceOratorianoSchema>
>
export type ParsedReplaceOratorianoFormValues = z.output<
  ReturnType<typeof createReplaceOratorianoSchema>
>
export type DeleteOratorianoFormValues =
  z.infer<typeof deleteOratorianoSchema>
