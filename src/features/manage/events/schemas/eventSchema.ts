import { z } from 'zod'

export const eventSchema = z.object({
  title: z.string().trim().min(1, 'Informe o título.').max(160),
  description: z.string().trim().max(2000),
  locationId: z.uuid('Selecione um local válido.'),
  requiredPermissionId: z.uuid('Selecione a permissão de público.'),
  beginDate: z.string().min(1, 'Informe o início.'),
  endDate: z.string().min(1, 'Informe o término.'),
  type: z.enum(['GENERIC', 'ORATORIO', 'MISSA']),
}).refine((value) => new Date(value.endDate) > new Date(value.beginDate), { message: 'O término deve ser posterior ao início.', path: ['endDate'] })

export type EventFormValues = z.infer<typeof eventSchema>
