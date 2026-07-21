import { describe, expect, it } from 'vitest'

import {
  getEventAudienceLabel,
  getEventMapUrl,
  getEventStatusLabel,
  getEventTypeLabel,
} from './presentation'

describe('apresentação de eventos', () => {
  it('traduz situação, tipo e público conhecidos', () => {
    expect(getEventStatusLabel('SCHEDULED')).toBe('Agendado')
    expect(getEventTypeLabel('ORATORIO')).toBe('Oratório')
    expect(getEventAudienceLabel('EVENT_GET_COORD')).toBe('Coordenação')
    expect(getEventAudienceLabel(null)).toBe('Público geral')
  })

  it('usa fallbacks neutros sem expor valores futuros', () => {
    expect(getEventStatusLabel('INTERNAL_STATUS')).toBe('Situação não identificada')
    expect(getEventTypeLabel('INTERNAL_TYPE')).toBe('Tipo não identificado')
    expect(getEventAudienceLabel('INTERNAL_PERMISSION')).toBe('Público não identificado')
  })

  it('cria o mapa pela localização do evento sem depender de chave externa', () => {
    const url = getEventMapUrl({
      city: 'Campinas',
      countryCode: 'BR',
      id: '550e8400-e29b-41d4-a716-446655440000',
      latitude: null,
      name: 'Sede',
      postalCode: null,
      state: 'SP',
      street: null,
      longitude: null,
    })

    expect(url).not.toBeNull()
    expect(new URL(url ?? '').searchParams.get('query')).toContain('Campinas')
    expect(new URL(url ?? '').searchParams.get('query')).toContain('Brasil')
  })
})
