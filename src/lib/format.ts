const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const regionNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' })

export function formatDate(value?: string | null): string {
  if (!value) {
    return 'Não informado'
  }

  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value)

  return Number.isNaN(date.getTime()) ? 'Data inválida' : dateFormatter.format(date)
}

export function formatDateTime(value?: string | null): string {
  if (!value) {
    return 'Não informado'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Data e hora inválidas' : dateTimeFormatter.format(date)
}

export function formatCountryName(countryCode?: string | null): string {
  if (!countryCode) {
    return 'País não informado'
  }

  const normalizedCode = countryCode.trim().toUpperCase()

  try {
    const countryName = regionNames.of(normalizedCode)
    return countryName && countryName !== normalizedCode
      ? countryName
      : 'País não identificado'
  } catch {
    return 'País não identificado'
  }
}
