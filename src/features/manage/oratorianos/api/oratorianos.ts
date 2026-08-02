import type { components } from '@/api/generated/gam-api'
import type { SearchFilter } from '@/components/SearchAndFilter'
import { api } from '@/lib/http'

export type Oratoriano = components['schemas']['OratorianoRDTO']
export type OratorianoPage =
  components['schemas']['PagedResponseOratorianoRDTO']
export type RegisterOratoriano =
  components['schemas']['RegisterOratorianoDTO']
export type ReplaceOratoriano =
  components['schemas']['ReplaceOratorianoDTO']
export type DeleteOratorianoReason =
  components['schemas']['ReasonDTO']
export type OratorianoAttendancePage =
  components['schemas']['PagedResponseAttendanceHistoryItemRDTO']
export type OratorianoAttendanceSummary =
  components['schemas']['AttendanceSummaryRDTO']

export type OratorianoSearch = {
  filters: SearchFilter[]
  sorts: string[]
}

const ORATORIANO_SORT_FIELDS = ['oratorioYearAttendances'] as const

function isSupportedOratorianoSort(value: string): boolean {
  const [field, direction, ...rest] = value.split(',')
  return (
    rest.length === 0 &&
    ORATORIANO_SORT_FIELDS.some((allowedField) => allowedField === field) &&
    (direction === 'asc' || direction === 'desc')
  )
}

export async function searchOratorianos(
  search: OratorianoSearch,
  page: number,
  size = 12,
): Promise<OratorianoPage> {
  const filters = search.filters.filter(
    (filter) =>
      filter.field === 'name' &&
      filter.comparisonMethod === 'LIKE' &&
      typeof filter.value === 'string' &&
      filter.value.trim().length > 0,
  ).map((filter) => ({
    ...filter,
    value: typeof filter.value === 'string' ? filter.value.trim() : filter.value,
  }))
  const requestedSorts = search.sorts.filter(isSupportedOratorianoSort)
  const { data } = await api.post<OratorianoPage>(
    '/oratorianos/search',
    { filters },
    {
      params: {
        page,
        size,
        ...(requestedSorts.length > 0 ? { sort: requestedSorts } : {}),
      },
    },
  )
  return data
}

export async function registerOratoriano(
  payload: RegisterOratoriano,
): Promise<Oratoriano> {
  const { data } = await api.post<Oratoriano>('/oratorianos', payload)
  return data
}

export async function getOratoriano(
  oratorianoId: string,
): Promise<Oratoriano> {
  const { data } = await api.get<Oratoriano>(
    `/oratorianos/${oratorianoId}`,
  )
  return data
}

export async function replaceOratoriano(
  oratorianoId: string,
  payload: ReplaceOratoriano,
): Promise<Oratoriano> {
  const { data } = await api.put<Oratoriano>(
    `/oratorianos/${oratorianoId}`,
    payload,
  )
  return data
}

export async function deleteOratoriano(
  oratorianoId: string,
  payload: DeleteOratorianoReason,
): Promise<void> {
  await api.delete(`/oratorianos/${oratorianoId}`, {
    data: payload,
  })
}

export async function getOratorianoAttendances(
  oratorianoId: string,
  page: number,
  size = 10,
): Promise<OratorianoAttendancePage> {
  const { data } = await api.get<OratorianoAttendancePage>(
    `/oratorianos/${oratorianoId}/attendances`,
    { params: { page, size } },
  )
  return data
}

export async function getOratorianoAttendanceSummary(
  oratorianoId: string,
  year?: number,
  month?: number,
): Promise<OratorianoAttendanceSummary> {
  const { data } = await api.get<OratorianoAttendanceSummary>(
    `/oratorianos/${oratorianoId}/attendance-summary`,
    {
      params: {
        ...(year === undefined ? {} : { year }),
        ...(month === undefined ? {} : { month }),
      },
    },
  )
  return data
}
