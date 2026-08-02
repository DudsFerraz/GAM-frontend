import {
  formatOratorioDate,
  formatOratorioShortDate,
} from './presentation'

const ORATORIO_TIME_ZONE = 'America/Sao_Paulo'

const MONTHS_BY_NAME: Record<string, number> = {
  janeiro: 1,
  fevereiro: 2,
  marco: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
}

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  calendar: 'gregory',
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
  minute: '2-digit',
  month: '2-digit',
  second: '2-digit',
  timeZone: ORATORIO_TIME_ZONE,
  year: 'numeric',
})

type CivilDate = {
  day: number
  month: number
  year: number
}

type DateTimeParts = CivilDate & {
  hour: number
  minute: number
  second: number
}

export type OratorioDateRange = {
  from: string
  to: string
}

export function normalizeOratorioDateSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
}

function parseCivilDate(value: string): CivilDate | null {
  const shortMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value)
  const longMatch = /^(\d{1,2}) de ([a-z]+) de (\d{4})$/.exec(value)

  const day = Number(shortMatch?.[1] ?? longMatch?.[1])
  const month = shortMatch
    ? Number(shortMatch[2])
    : MONTHS_BY_NAME[longMatch?.[2] ?? '']
  const year = Number(shortMatch?.[3] ?? longMatch?.[3])

  if (!Number.isInteger(day)
    || !Number.isInteger(month)
    || !Number.isInteger(year)
    || year < 1
    || year > 9999
    || month < 1
    || month > 12
    || day < 1
    || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) {
    return null
  }

  return { day, month, year }
}

function getDateTimeParts(date: Date): DateTimeParts {
  const parts = dateTimeFormatter.formatToParts(date)
  const getPart = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value
    return Number(value)
  }

  return {
    day: getPart('day'),
    hour: getPart('hour'),
    minute: getPart('minute'),
    month: getPart('month'),
    second: getPart('second'),
    year: getPart('year'),
  }
}

function getTimeZoneOffset(date: Date): number {
  const local = getDateTimeParts(date)
  const localAsUtc = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    local.hour,
    local.minute,
    local.second,
  )

  return localAsUtc - date.getTime()
}

function toUtcInstant(date: CivilDate): Date {
  const localAsUtc = Date.UTC(date.year, date.month - 1, date.day)
  const firstGuess = new Date(
    localAsUtc - getTimeZoneOffset(new Date(localAsUtc)),
  )
  const correctedGuess = new Date(
    localAsUtc - getTimeZoneOffset(firstGuess),
  )

  return correctedGuess
}

function getNextCivilDate(date: CivilDate): CivilDate {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day + 1))
  return {
    day: next.getUTCDate(),
    month: next.getUTCMonth() + 1,
    year: next.getUTCFullYear(),
  }
}

export function parseOratorioDateRange(
  value: string,
): OratorioDateRange | null {
  const civilDate = parseCivilDate(normalizeOratorioDateSearch(value))
  if (!civilDate) return null

  const start = toUtcInstant(civilDate)
  const nextStart = toUtcInstant(getNextCivilDate(civilDate))

  return {
    from: start.toISOString(),
    to: new Date(nextStart.getTime() - 1).toISOString(),
  }
}

export function matchesOratorioDateSearch(
  beginDate: string | null | undefined,
  value: string,
): boolean {
  const normalizedValue = normalizeOratorioDateSearch(value)
  if (!normalizedValue) return true

  const longDate = normalizeOratorioDateSearch(formatOratorioDate(beginDate))
  const shortDate = normalizeOratorioDateSearch(
    formatOratorioShortDate(beginDate),
  )

  return longDate.includes(normalizedValue)
    || shortDate.includes(normalizedValue)
}
