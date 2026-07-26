import { resolvePresentationLabel } from '@/lib/presentation'

import type {
  AttendancePerson,
  OratorioScheduleItem,
  OratorioTeamType,
} from './api/oratorios'

export const ORATORIO_TEAM_LABELS = {
  LANCHE: 'Equipe do Lanche',
  GINCANA: 'Equipe da Gincana',
  BOA_TARDE_CRIANCAS: 'Boa Tarde das Crianças',
  BOA_TARDE_JOVENS: 'Boa Tarde dos Jovens',
} as const satisfies Record<OratorioTeamType, string>

export const ORATORIO_FIXED_SCHEDULE = [
  {
    activity: 'Recreação livre',
    endTime: '15:30',
    startTime: '14:00',
  },
  {
    activity: 'Gincana',
    endTime: '16:30',
    startTime: '15:30',
  },
  {
    activity: 'Boa Tarde das Crianças e dos Jovens',
    endTime: '17:00',
    startTime: '16:30',
  },
  {
    activity: 'Lanche e encerramento',
    endTime: null,
    startTime: '17:00',
  },
] as const

const EXPECTED_ORATORIO_SCHEDULE = [
  {
    activity: 'Recreação livre',
    closingBoundary: false,
    endTime: '15:30',
    startTime: '14:00',
  },
  {
    activity: 'Gincana',
    closingBoundary: false,
    endTime: '16:30',
    startTime: '15:30',
  },
  {
    activity: 'Boa Tarde das Crianças and Boa Tarde dos Jovens',
    closingBoundary: false,
    endTime: '17:00',
    startTime: '16:30',
  },
  {
    activity: 'Lanche',
    closingBoundary: true,
    endTime: null,
    startTime: '17:00',
  },
] as const

const oratorioDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
})

const oratorioShortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
})

const localDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
  year: 'numeric',
})

export function getOratorioTeamLabel(value?: string | null): string {
  return resolvePresentationLabel(
    ORATORIO_TEAM_LABELS,
    value,
    'Equipe não identificada',
  )
}

export function getOratorioSchedulePresentation(
  schedule?: OratorioScheduleItem[] | null,
): typeof ORATORIO_FIXED_SCHEDULE | null {
  if (!Array.isArray(schedule)
    || schedule.length !== EXPECTED_ORATORIO_SCHEDULE.length) {
    return null
  }

  const hasExpectedStructure = EXPECTED_ORATORIO_SCHEDULE.every(
    (expected, index) => {
      const received = schedule[index]

      return received?.startTime === expected.startTime
        && (received.endTime ?? null) === expected.endTime
        && received.activity === expected.activity
        && received.closingBoundary === expected.closingBoundary
    },
  )

  return hasExpectedStructure ? ORATORIO_FIXED_SCHEDULE : null
}

export function getAttendancePersonName(
  person?: AttendancePerson | null,
): string {
  const name = [person?.firstName, person?.surname]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(' ')

  return name || 'Nome não informado'
}

export function getAttendancePersonRestrictionLabel(
  person?: AttendancePerson | null,
): string | null {
  if (person?.deleted) return 'Cadastro removido'
  if (person?.status === 'INACTIVE') return 'Membro inativo'
  return null
}

function formatOratorioDateWith(
  formatter: Intl.DateTimeFormat,
  value?: string | null,
): string {
  if (!value) return 'Data não informada'

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Data não identificada'
    : formatter.format(date)
}

export function formatOratorioDate(value?: string | null): string {
  return formatOratorioDateWith(oratorioDateFormatter, value)
}

export function formatOratorioShortDate(value?: string | null): string {
  return formatOratorioDateWith(oratorioShortDateFormatter, value)
}

export function formatOratorioLocalDate(value?: string | null): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value ? 'Data não identificada' : 'Data não informada'
  }

  const date = new Date(`${value}T12:00:00Z`)
  return Number.isNaN(date.getTime())
    ? 'Data não identificada'
    : localDateFormatter.format(date)
}
