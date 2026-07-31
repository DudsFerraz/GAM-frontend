import { z } from 'zod'

const reasonTextSchema = z
  .string()
  .trim()
  .min(1, 'Informe o motivo da exclusão.')
  .refine(
    (reason) => Array.from(reason).length <= 2000,
    'O motivo deve ter no máximo 2.000 caracteres.',
  )

export const oratorianoFormReasonSchema = z.object({
  reason: reasonTextSchema,
})

export type OratorianoFormReasonValues = z.infer<
  typeof oratorianoFormReasonSchema
>
