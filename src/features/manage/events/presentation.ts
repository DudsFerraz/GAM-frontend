import { resolvePresentationLabel } from '@/lib/presentation'
import { formatCountryName } from '@/lib/format'
import { getGoogleMapsSearchUrl } from '@/lib/maps'

import type { Event, EventStatus, EventType } from './api/events'

export const EVENT_STATUS_LABELS = {
  SCHEDULED: 'Agendado',
  COMPLETED: 'Concluído',
  LOCKED: 'Bloqueado',
  FINALIZED: 'Finalizado',
  CANCELLED: 'Cancelado',
} as const satisfies Record<EventStatus, string>

export type EventTypePresentation = {
  label: string
  cardAccentClassName: string
  typeMarkerClassName: string
  emphasized: boolean
}

export const EVENT_TYPE_PRESENTATIONS = {
  GENERIC: {
    label: 'Genérico',
    cardAccentClassName: '',
    typeMarkerClassName: 'text-muted-foreground',
    emphasized: false,
  },
  ORATORIO: {
    label: 'Oratório',
    cardAccentClassName:
      'border-l-4 border-l-[light-dark(#059669,#34d399)] hover:border-l-[light-dark(#059669,#34d399)] focus-within:border-l-[light-dark(#059669,#34d399)]',
    typeMarkerClassName: 'text-[light-dark(#047857,#6ee7b7)]',
    emphasized: true,
  },
  MISSA: {
    label: 'Missa',
    cardAccentClassName:
      'border-l-4 border-l-[light-dark(#d97706,#fbbf24)] hover:border-l-[light-dark(#d97706,#fbbf24)] focus-within:border-l-[light-dark(#d97706,#fbbf24)]',
    typeMarkerClassName: 'text-[light-dark(#b45309,#fcd34d)]',
    emphasized: true,
  },
} as const satisfies Record<EventType, EventTypePresentation>

const UNKNOWN_EVENT_TYPE_PRESENTATION = {
  label: 'Tipo não identificado',
  cardAccentClassName: '',
  typeMarkerClassName: 'text-muted-foreground',
  emphasized: false,
} as const satisfies EventTypePresentation

const EVENT_AUDIENCE_LABELS: Readonly<Record<string, string>> = {
  EVENT_GET_MEMBER: 'Membros e coordenação',
  EVENT_GET_COORD: 'Coordenação',
}

export function getEventStatusLabel(status?: string | null): string {
  return resolvePresentationLabel(
    EVENT_STATUS_LABELS,
    status,
    'Situação não identificada',
  )
}

function isKnownEventType(type: string): type is EventType {
  return Object.hasOwn(EVENT_TYPE_PRESENTATIONS, type)
}

export function getEventTypePresentation(
  type?: string | null,
): EventTypePresentation {
  if (!type || !isKnownEventType(type)) {
    return UNKNOWN_EVENT_TYPE_PRESENTATION
  }

  return EVENT_TYPE_PRESENTATIONS[type]
}

export function getEventTypeLabel(type?: string | null): string {
  return getEventTypePresentation(type).label
}

export function getEventAudienceLabel(permissionCode?: string | null): string {
  if (!permissionCode) {
    return 'Público geral'
  }

  return resolvePresentationLabel(
    EVENT_AUDIENCE_LABELS,
    permissionCode,
    'Público não identificado',
  )
}

export function getEventMapUrl(gamLocation: Event['gamLocation']): string | null {
  if (!gamLocation) {
    return null
  }

  return getGoogleMapsSearchUrl({
    name: gamLocation.name,
    street: gamLocation.street,
    city: gamLocation.city,
    state: gamLocation.state,
    postalCode: gamLocation.postalCode,
    country: formatCountryName(gamLocation.countryCode),
    latitude: gamLocation.latitude,
    longitude: gamLocation.longitude,
  })
}
