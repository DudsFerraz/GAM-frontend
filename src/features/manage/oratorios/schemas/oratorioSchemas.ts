import { z } from 'zod'

function isValidLocalDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
}

export const createOratorioSchema = z.object({
  date: z
    .string()
    .min(1, 'Informe a data do Oratório.')
    .refine(
      isValidLocalDate,
      'Informe uma data válida.',
    ),
})

const planningFieldSchema = z
  .string()
  .max(10000, 'O planejamento deve ter no máximo 10.000 caracteres.')

export const oratorioPlanningSchema = z.object({
  lancheDescription: planningFieldSchema,
  gincanaDescription: planningFieldSchema,
  boaTardeCriancasPlan: planningFieldSchema,
  boaTardeJovensPlan: planningFieldSchema,
})

export const oratorioReasonSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Informe o motivo.')
    .max(2000, 'O motivo deve ter no máximo 2.000 caracteres.'),
})

export type CreateOratorioFormValues =
  z.infer<typeof createOratorioSchema>
export type OratorioPlanningFormValues =
  z.infer<typeof oratorioPlanningSchema>
export type OratorioReasonFormValues =
  z.infer<typeof oratorioReasonSchema>
