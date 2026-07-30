import { describe, expect, it } from 'vitest'

import {
  EVENT_TYPE_PRESENTATIONS,
  getEventAudienceLabel,
  getEventMapUrl,
  getEventStatusLabel,
  getEventTypeLabel,
  getEventTypePresentation,
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

  it('centraliza a apresentação neutra e especializada de cada tipo', () => {
    expect(EVENT_TYPE_PRESENTATIONS.GENERIC).toMatchObject({
      label: 'Genérico',
      cardAccentClassName: '',
      typeMarkerClassName: 'text-muted-foreground',
      emphasized: false,
    })
    expect(EVENT_TYPE_PRESENTATIONS.ORATORIO).toMatchObject({
      label: 'Oratório',
      emphasized: true,
    })
    expect(EVENT_TYPE_PRESENTATIONS.ORATORIO.cardAccentClassName).toContain(
      'border-l-[light-dark(#059669,#34d399)]',
    )
    expect(EVENT_TYPE_PRESENTATIONS.ORATORIO.typeMarkerClassName).toBe(
      'text-[light-dark(#047857,#6ee7b7)]',
    )
    expect(EVENT_TYPE_PRESENTATIONS.MISSA.cardAccentClassName).toContain(
      'border-l-[light-dark(#d97706,#fbbf24)]',
    )
    expect(EVENT_TYPE_PRESENTATIONS.MISSA.typeMarkerClassName).toBe(
      'text-[light-dark(#b45309,#fcd34d)]',
    )
  })

  it('mantém tipos ausentes ou futuros com apresentação neutra', () => {
    expect(getEventTypePresentation(null)).toEqual({
      label: 'Tipo não identificado',
      cardAccentClassName: '',
      typeMarkerClassName: 'text-muted-foreground',
      emphasized: false,
    })
    expect(getEventTypePresentation('INTERNAL_TYPE')).toEqual(
      getEventTypePresentation(null),
    )
  })

  it('cria o mapa pela localização do evento sem depender de chave externa', () => {
    const url = getEventMapUrl({
      city: 'Campinas',
      code: null,
      countryCode: 'BR',
      id: '550e8400-e29b-41d4-a716-446655440000',
      latitude: null,
      name: 'Sede',
      postalCode: null,
      state: 'SP',
      street: null,
      systemManaged: false,
      longitude: null,
    })

    expect(url).not.toBeNull()
    expect(new URL(url ?? '').searchParams.get('query')).toContain('Campinas')
    expect(new URL(url ?? '').searchParams.get('query')).toContain('Brasil')
  })
})
