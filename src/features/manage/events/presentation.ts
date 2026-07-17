import { resolvePresentationLabel } from '@/lib/presentation'

import type { EventStatus, EventType } from './api/events'

export const EVENT_STATUS_LABELS = {
  SCHEDULED: 'Agendado',
  COMPLETED: 'Concluído',
  LOCKED: 'Bloqueado',
  FINALIZED: 'Finalizado',
  CANCELLED: 'Cancelado',
} as const satisfies Record<EventStatus, string>

export const EVENT_TYPE_LABELS = {
  GENERIC: 'Genérico',
  ORATORIO: 'Oratório',
  MISSA: 'Missa',
} as const satisfies Record<EventType, string>

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

export function getEventTypeLabel(type?: string | null): string {
  return resolvePresentationLabel(EVENT_TYPE_LABELS, type, 'Tipo não identificado')
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
