import { resolvePresentationLabel } from '@/lib/presentation'

import type { MemberListItem } from './types'

type MemberStatus = NonNullable<MemberListItem['status']>

export const MEMBER_STATUS_LABELS = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
} as const satisfies Record<MemberStatus, string>

export function getMemberStatusLabel(status?: string | null): string {
  return resolvePresentationLabel(
    MEMBER_STATUS_LABELS,
    status,
    'Situação não informada',
  )
}
