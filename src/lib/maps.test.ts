import { describe, expect, it } from 'vitest'

import { getGoogleMapsSearchUrl } from './maps'

function getMapQuery(url: string | null): string | null {
  return url ? new URL(url).searchParams.get('query') : null
}

describe('getGoogleMapsSearchUrl', () => {
  it('prioriza coordenadas válidas, inclusive zero', () => {
    const url = getGoogleMapsSearchUrl({
      name: 'Endereço ignorado',
      latitude: 0,
      longitude: -47.06,
    })

    expect(getMapQuery(url)).toBe('0,-47.06')
  })

  it('monta a busca com os dados de endereço disponíveis', () => {
    const url = getGoogleMapsSearchUrl({
      name: 'Sede do GAM',
      street: 'Rua Central, 10',
      city: 'Campinas',
      state: 'SP',
      postalCode: '13000-000',
      country: 'Brasil',
    })

    expect(getMapQuery(url)).toBe(
      'Sede do GAM, Rua Central, 10, 13000-000, Campinas, SP, Brasil',
    )
  })

  it('ignora coordenadas não finitas e usa o endereço', () => {
    const url = getGoogleMapsSearchUrl({
      city: 'Campinas',
      latitude: Number.NaN,
      longitude: 10,
    })

    expect(getMapQuery(url)).toBe('Campinas')
  })

  it.each([undefined, null, {}, { name: '   ' }])(
    'não cria link sem uma localização pesquisável (%s)',
    (location) => {
      expect(getGoogleMapsSearchUrl(location)).toBeNull()
    },
  )
})
