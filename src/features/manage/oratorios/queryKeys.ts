import type { AttendanceKind } from './api/oratorios'

export const oratorioQueryKeys = {
  all: ['oratorios'] as const,
  details: () => [...oratorioQueryKeys.all, 'detail'] as const,
  detail: (oratorioId: string) =>
    [...oratorioQueryKeys.details(), oratorioId] as const,
  attendance: (oratorioId: string) =>
    [...oratorioQueryKeys.detail(oratorioId), 'attendance'] as const,
  rosters: (oratorioId: string, kind: AttendanceKind) =>
    [...oratorioQueryKeys.attendance(oratorioId), 'roster', kind] as const,
  roster: (
    oratorioId: string,
    kind: AttendanceKind,
    page: number,
    name: string,
  ) => [...oratorioQueryKeys.rosters(oratorioId, kind), { name, page }] as const,
  exactOratorianoNames: (oratorioId: string) =>
    [
      ...oratorioQueryKeys.attendance(oratorioId),
      'exact-oratoriano-name',
    ] as const,
  exactOratorianoName: (
    oratorioId: string,
    firstName: string,
    surname: string,
  ) => [
    ...oratorioQueryKeys.exactOratorianoNames(oratorioId),
    { firstName, surname },
  ] as const,
  present: (oratorioId: string) =>
    [...oratorioQueryKeys.attendance(oratorioId), 'present'] as const,
}
