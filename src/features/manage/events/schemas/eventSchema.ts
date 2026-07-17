import { z } from 'zod'

export const eventSchema = z.object({
  title: z.string().trim().min(1, 'Informe o título.').max(160, 'O título deve ter no máximo 160 caracteres.'),
  description: z.string().trim().max(2000, 'A descrição deve ter no máximo 2.000 caracteres.'),
  locationId: z.uuid('Selecione um local válido.'),
  requiredPermissionId: z.uuid('Selecione o público do evento.'),
  beginDate: z.string().min(1, 'Informe o início.'),
  endDate: z.string().min(1, 'Informe o término.'),
  type: z.enum(['GENERIC', 'ORATORIO', 'MISSA'], { error: 'Selecione um tipo de evento válido.' }),
}).refine((value) => new Date(value.endDate) > new Date(value.beginDate), { message: 'O término deve ser posterior ao início.', path: ['endDate'] })

export type EventFormValues = z.infer<typeof eventSchema>
