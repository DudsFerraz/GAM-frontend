import type { EventStatus } from './api/events'

export type GenericEventManagementAction =
  | 'edit'
  | 'cancel'
  | 'lock'
  | 'finalize'
  | 'reopen'
  | 'remove'

const ACTIONS_BY_STATUS = {
  SCHEDULED: ['edit', 'cancel', 'remove'],
  COMPLETED: ['edit', 'lock', 'finalize', 'remove'],
  LOCKED: ['edit', 'finalize', 'reopen'],
  FINALIZED: ['reopen'],
  CANCELLED: ['remove'],
} as const satisfies Record<EventStatus, readonly GenericEventManagementAction[]>

export function getGenericEventManagementActions(
  status?: string | null,
): readonly GenericEventManagementAction[] {
  return status && Object.prototype.hasOwnProperty.call(ACTIONS_BY_STATUS, status)
    ? ACTIONS_BY_STATUS[status as EventStatus]
    : []
}
