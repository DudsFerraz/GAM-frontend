import type { Oratoriano } from './api/oratorianos'

export function getOratorianoFullName(
  oratoriano?: Pick<Oratoriano, 'firstName' | 'surname'> | null,
): string {
  const name = [oratoriano?.firstName, oratoriano?.surname]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(' ')

  return name || 'Nome não informado'
}

export function getAttendanceCount(value?: number | null): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : 0
}
