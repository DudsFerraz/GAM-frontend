import { resolvePresentationLabel } from '@/lib/presentation'

import type { SolicitationStatus } from './api/solicitations'

export const SOLICITATION_STATUS_LABELS = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
} as const satisfies Record<SolicitationStatus, string>

export function getSolicitationStatusLabel(status?: string | null): string {
  return resolvePresentationLabel(
    SOLICITATION_STATUS_LABELS,
    status,
    'Situação não identificada',
  )
}
