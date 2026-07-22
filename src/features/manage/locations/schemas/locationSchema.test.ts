import { describe, expect, it } from 'vitest'

import { locationSchema, toLocationMutationPayload } from './locationSchema'

const validLocation = {
  city: 'Campinas',
  countryCode: 'br',
  latitude: '-22.90',
  longitude: '-47.06',
  name: 'Sede do GAM',
  postalCode: '13000-000',
  state: 'SP',
  street: 'Rua Central, 10',
}

describe('locationSchema', () => {
  it('normaliza o país e aceita coordenadas decimais válidas', () => {
    const result = locationSchema.parse(validLocation)

    expect(result.countryCode).toBe('BR')
    expect(result.latitude).toBe('-22.90')
    expect(result.longitude).toBe('-47.06')
  })

  it('permite coordenadas opcionais', () => {
    expect(locationSchema.safeParse({
      ...validLocation,
      latitude: '',
      longitude: '',
    }).success).toBe(true)
  })

  it('exige que latitude e longitude sejam informadas juntas', () => {
    const result = locationSchema.safeParse({ ...validLocation, longitude: '' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        latitude: ['Informe latitude e longitude juntas.'],
        longitude: ['Informe latitude e longitude juntas.'],
      })
    }
  })

  it.each([
    ['latitude', '91', 'A latitude deve ficar entre -90 e 90.'],
    ['longitude', '-181', 'A longitude deve ficar entre -180 e 180.'],
    ['latitude', 'não-numérico', 'Informe um número válido com até 8 casas decimais.'],
    ['longitude', '10.123456789', 'Informe um número válido com até 8 casas decimais.'],
  ] as const)('rejeita %s fora do contrato', (field, value, message) => {
    const result = locationSchema.safeParse({ ...validLocation, [field]: value })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors[field]).toContain(message)
    }
  })

  it('rejeita código de país e campos obrigatórios inválidos em português', () => {
    const result = locationSchema.safeParse({
      ...validLocation,
      city: '',
      countryCode: '1!',
      name: '',
      state: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        city: ['Informe a cidade.'],
        countryCode: ['O país informado é inválido.'],
        name: ['Informe o nome do local.'],
        state: ['Informe o estado.'],
      })
    }
  })

  it('transforma os valores do formulário no corpo completo da mutação', () => {
    expect(toLocationMutationPayload({ ...validLocation, latitude: '', longitude: '', street: '', postalCode: '' })).toEqual({
      name: 'Sede do GAM', street: null, city: 'Campinas', state: 'SP', postalCode: null, countryCode: 'BR', latitude: null, longitude: null,
    })
  })
})
