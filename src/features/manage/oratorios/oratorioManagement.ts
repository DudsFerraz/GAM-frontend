import type { EventStatus } from '@/features/manage/events'

export type OratorioLifecycleAction =
  | 'cancel'
  | 'lock'
  | 'finalize'
  | 'reopen-completed'
  | 'reopen-locked'
  | 'remove'

const ACTIONS_BY_STATUS = {
  SCHEDULED: ['cancel', 'remove'],
  COMPLETED: ['lock', 'finalize', 'remove'],
  LOCKED: ['finalize', 'reopen-completed'],
  FINALIZED: ['reopen-locked', 'reopen-completed'],
  CANCELLED: ['remove'],
} as const satisfies Record<
  EventStatus,
  readonly OratorioLifecycleAction[]
>

export function getOratorioLifecycleActions(
  status?: string | null,
): readonly OratorioLifecycleAction[] {
  return status && Object.prototype.hasOwnProperty.call(ACTIONS_BY_STATUS, status)
    ? ACTIONS_BY_STATUS[status as EventStatus]
    : []
}

export function canEditOratorioPlanning(status?: string | null): boolean {
  return status === 'SCHEDULED'
    || status === 'COMPLETED'
    || status === 'LOCKED'
}
