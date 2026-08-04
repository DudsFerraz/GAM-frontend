import type { Event, EventStatus } from '@/features/manage/events'

export type AttendanceAvailability = {
  canMark: boolean
  canUncheck: boolean
  removalReasonRequired: boolean
  message: string | null
}

const UNAVAILABLE_MESSAGE =
  'Não foi possível determinar a disponibilidade das presenças. Atualize a página e tente novamente.'

export function getEffectiveOratorioStatus(
  event?: Event | null,
  evaluationInstant = new Date(),
): EventStatus | undefined {
  if (!event?.status) return undefined

  const status = event.status

  if (status !== 'SCHEDULED') {
    return status
  }

  if (!event.endDate || Number.isNaN(evaluationInstant.getTime())) {
    return status
  }

  const endDate = new Date(event.endDate)
  if (Number.isNaN(endDate.getTime())) return status

  return endDate > evaluationInstant ? 'SCHEDULED' : 'COMPLETED'
}

export function getOratorioAttendanceAvailability(
  event?: Event | null,
  evaluationInstant = new Date(),
): AttendanceAvailability {
  const status = getEffectiveOratorioStatus(event, evaluationInstant)

  if (!status) {
    return {
      canMark: false,
      canUncheck: false,
      message: UNAVAILABLE_MESSAGE,
      removalReasonRequired: false,
    }
  }

  if (status === 'COMPLETED') {
    return {
      canMark: true,
      canUncheck: true,
      message: null,
      removalReasonRequired: true,
    }
  }

  if (status === 'CANCELLED') {
    return {
      canMark: false,
      canUncheck: true,
      message:
        'O Oratório foi cancelado. Somente marcações existentes podem ser removidas.',
      removalReasonRequired: false,
    }
  }

  if (status === 'LOCKED') {
    return {
      canMark: false,
      canUncheck: false,
      message: 'As presenças deste Oratório estão bloqueadas.',
      removalReasonRequired: false,
    }
  }

  if (status === 'FINALIZED') {
    return {
      canMark: false,
      canUncheck: false,
      message: 'Este Oratório foi finalizado e as presenças estão fechadas.',
      removalReasonRequired: false,
    }
  }

  return {
    canMark: true,
    canUncheck: true,
    message: null,
    removalReasonRequired: false,
  }
}
