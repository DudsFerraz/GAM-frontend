import { z } from 'zod'

const eventFields = {
  title: z.string().trim().min(1, 'Informe o título.').max(255, 'O título deve ter no máximo 255 caracteres.'),
  description: z.string().trim().max(10000, 'A descrição deve ter no máximo 10.000 caracteres.'),
  locationId: z.uuid('Selecione um local válido.'),
  requiredPermissionId: z.string().refine(
    (value) => value === '' || z.uuid().safeParse(value).success,
    'Selecione um público válido.',
  ),
  beginDate: z.string().min(1, 'Informe o início.'),
  endDate: z.string().min(1, 'Informe o término.'),
} as const

function validateDateRange(
  value: { beginDate: string; endDate: string },
  context: z.RefinementCtx,
) {
  if (!(new Date(value.endDate) > new Date(value.beginDate))) {
    context.addIssue({
      code: 'custom',
      message: 'O término deve ser posterior ao início.',
      path: ['endDate'],
    })
  }
}

export const eventSchema = z.object(eventFields).superRefine(validateDateRange)

export function createEventEditSchema(currentRequiredPermissionId?: string | null) {
  return z.object({
    ...eventFields,
    reason: z.string().trim().max(2000, 'O motivo deve ter no máximo 2.000 caracteres.'),
  }).superRefine((value, context) => {
    validateDateRange(value, context)

    const currentAudience = currentRequiredPermissionId || ''
    if (value.requiredPermissionId !== currentAudience && !value.reason) {
      context.addIssue({
        code: 'custom',
        message: 'Informe o motivo da alteração do público.',
        path: ['reason'],
      })
    }
  })
}

export const eventReasonSchema = z.object({
  reason: z.string().trim()
    .min(1, 'Informe o motivo.')
    .max(2000, 'O motivo deve ter no máximo 2.000 caracteres.'),
})

export const reopenEventSchema = z.object({
  targetStatus: z.enum(
    ['LOCKED', 'COMPLETED'],
    'Selecione como o evento deve ser reaberto.',
  ),
  reason: z.string().trim()
    .min(1, 'Informe o motivo da reabertura.')
    .max(2000, 'O motivo deve ter no máximo 2.000 caracteres.'),
})

export type EventFormValues = z.infer<typeof eventSchema>
export type EventEditFormValues = z.infer<ReturnType<typeof createEventEditSchema>>
export type EventReasonFormValues = z.infer<typeof eventReasonSchema>
export type ReopenEventFormValues = z.infer<typeof reopenEventSchema>
