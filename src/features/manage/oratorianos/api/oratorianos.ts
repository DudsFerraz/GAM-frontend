import type { components } from '@/api/generated/gam-api'
import { api } from '@/lib/http'

export type Oratoriano = components['schemas']['OratorianoRDTO']
export type OratorianoPage =
  components['schemas']['PagedResponseOratorianoRDTO']
export type RegisterOratoriano =
  components['schemas']['RegisterOratorianoDTO']
export type ReplaceOratoriano =
  components['schemas']['ReplaceOratorianoDTO']
export type OratorianoAttendancePage =
  components['schemas']['PagedResponseAttendanceHistoryItemRDTO']
export type OratorianoAttendanceSummary =
  components['schemas']['AttendanceSummaryRDTO']

export async function searchOratorianos(
  name: string,
  page: number,
  size = 12,
): Promise<OratorianoPage> {
  const normalizedName = name.trim()
  const filters: components['schemas']['SpecificationFilterDTO'][] =
    normalizedName
      ? [{
          field: 'name',
          value: normalizedName,
          comparationMethod: 'LIKE',
        }]
      : []
  const { data } = await api.post<OratorianoPage>(
    '/oratorianos/search',
    { filters },
    { params: { page, size } },
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
