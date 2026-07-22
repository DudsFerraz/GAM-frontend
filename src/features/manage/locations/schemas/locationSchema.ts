import { z } from 'zod'

const optionalDecimal = z.string().trim().refine(
  (value) => value === '' || /^-?\d+(?:\.\d{1,8})?$/.test(value),
  'Informe um número válido com até 8 casas decimais.',
)

export const locationSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do local.').max(255, 'O nome deve ter no máximo 255 caracteres.'),
  street: z.string().trim().max(255, 'O endereço deve ter no máximo 255 caracteres.'),
  city: z.string().trim().min(1, 'Informe a cidade.').max(100, 'A cidade deve ter no máximo 100 caracteres.'),
  state: z.string().trim().min(1, 'Informe o estado.').max(50, 'O estado deve ter no máximo 50 caracteres.'),
  postalCode: z.string().trim().max(20, 'O código postal deve ter no máximo 20 caracteres.'),
  countryCode: z.string().trim().regex(/^[A-Za-z]{2}$/, 'O país informado é inválido.').transform((value) => value.toUpperCase()),
  latitude: optionalDecimal.refine((value) => value === '' || Math.abs(Number(value)) <= 90, 'A latitude deve ficar entre -90 e 90.'),
  longitude: optionalDecimal.refine((value) => value === '' || Math.abs(Number(value)) <= 180, 'A longitude deve ficar entre -180 e 180.'),
}).superRefine(({ latitude, longitude }, context) => {
  if ((latitude === '') === (longitude === '')) {
    return
  }

  context.addIssue({ code: 'custom', message: 'Informe latitude e longitude juntas.', path: ['latitude'] })
  context.addIssue({ code: 'custom', message: 'Informe latitude e longitude juntas.', path: ['longitude'] })
})

export const removeLocationSchema = z.object({
  reason: z.string().trim().min(1, 'Informe o motivo da remoção.').max(2000, 'O motivo deve ter no máximo 2.000 caracteres.'),
})

export type LocationFormValues = z.input<typeof locationSchema>
export type ParsedLocationFormValues = z.output<typeof locationSchema>
export type RemoveLocationFormValues = z.input<typeof removeLocationSchema>

export function toLocationMutationPayload(values: LocationFormValues) {
  const parsed = locationSchema.parse(values)
  const coordinates = parsed.latitude === ''
    ? { latitude: null, longitude: null }
    : { latitude: Number(parsed.latitude), longitude: Number(parsed.longitude) }

  return {
    name: parsed.name,
    street: parsed.street || null,
    city: parsed.city,
    state: parsed.state,
    postalCode: parsed.postalCode || null,
    countryCode: parsed.countryCode,
    ...coordinates,
  }
}
