import { resolvePresentationLabel } from '@/lib/presentation'

import type { MemberListItem } from './types'

type MemberStatus = NonNullable<MemberListItem['status']>

export const MEMBER_STATUS_LABELS = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
} as const satisfies Record<MemberStatus, string>

export function getMemberStatusBadgeClassName(status?: string | null): string {
  if (status === 'ACTIVE') {
    return 'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
  }

  if (status === 'INACTIVE') {
    return 'border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'
  }

  return 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
}

export function getMemberStatusLabel(status?: string | null): string {
  return resolvePresentationLabel(
    MEMBER_STATUS_LABELS,
    status,
    'Situação não informada',
  )
}
