import { z } from 'zod'

export const eventSchema = z.object({
  title: z.string().trim().min(1, 'Informe o título.').max(255, 'O título deve ter no máximo 255 caracteres.'),
  description: z.string().trim().max(10000, 'A descrição deve ter no máximo 10.000 caracteres.'),
  locationId: z.uuid('Selecione um local válido.'),
  requiredPermissionId: z.string().refine(
    (value) => value === '' || z.uuid().safeParse(value).success,
    'Selecione um público válido.',
  ),
  beginDate: z.string().min(1, 'Informe o início.'),
  endDate: z.string().min(1, 'Informe o término.'),
}).refine((value) => new Date(value.endDate) > new Date(value.beginDate), { message: 'O término deve ser posterior ao início.', path: ['endDate'] })

export type EventFormValues = z.infer<typeof eventSchema>
