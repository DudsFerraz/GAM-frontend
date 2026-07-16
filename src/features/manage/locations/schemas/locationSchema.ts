import { z } from 'zod'

const optionalDecimal = z.string().trim().refine((value) => value === '' || Number.isFinite(Number(value)), 'Informe um número válido.')

export const locationSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do local.').max(150),
  street: z.string().trim().max(200),
  city: z.string().trim().min(1, 'Informe a cidade.').max(100),
  state: z.string().trim().min(1, 'Informe o estado.').max(100),
  postalCode: z.string().trim().max(20),
  countryCode: z.string().trim().length(2, 'Use o código ISO com duas letras.').transform((value) => value.toUpperCase()),
  latitude: optionalDecimal.refine((value) => value === '' || Math.abs(Number(value)) <= 90, 'A latitude deve ficar entre -90 e 90.'),
  longitude: optionalDecimal.refine((value) => value === '' || Math.abs(Number(value)) <= 180, 'A longitude deve ficar entre -180 e 180.'),
})

export type LocationFormValues = z.input<typeof locationSchema>
export type ParsedLocationFormValues = z.output<typeof locationSchema>
