import type { components } from '@/api/generated/gam-api'
import { api } from '@/lib/http'

export type Oratorio = components['schemas']['OratorioRDTO']
export type CreateOratorio = components['schemas']['CreateOratorioDTO']
export type OratorioPlanning = components['schemas']['PlanningDTO']
export type OratorioTeam = components['schemas']['TeamRDTO']
export type OratorioTeamType = NonNullable<OratorioTeam['type']>
export type OratorioTeamMember =
  components['schemas']['TeamMemberRDTO']
export type OratorioScheduleItem =
  components['schemas']['ScheduleItemRDTO']
export type Attendance = components['schemas']['AttendanceRDTO']
export type AttendancePerson =
  components['schemas']['AttendancePersonRDTO']
export type AttendanceRosterPage =
  components['schemas']['PagedResponseRosterEntryRDTO']
export type AttendanceRosterEntry =
  components['schemas']['RosterEntryRDTO']
export type PresentSummary = components['schemas']['PresentSummaryRDTO']
export type QuickRegistration =
  components['schemas']['QuickRegistrationRDTO']
export type RegisterOratoriano =
  components['schemas']['RegisterOratorianoDTO']
export type OratorioReason = components['schemas']['ReasonDTO']
export type OratorioReopenTarget = 'COMPLETED' | 'LOCKED'
export type AttendanceKind = 'members' | 'oratorianos'

export async function createOratorio(
  payload: CreateOratorio,
): Promise<Oratorio> {
  const { data } = await api.post<Oratorio>('/oratorios', payload)
  return data
}

export async function getOratorio(oratorioId: string): Promise<Oratorio> {
  const { data } = await api.get<Oratorio>(`/oratorios/${oratorioId}`)
  return data
}

export async function replaceOratorioPlanning(
  oratorioId: string,
  payload: OratorioPlanning,
): Promise<Oratorio> {
  const { data } = await api.put<Oratorio>(
    `/oratorios/${oratorioId}/planning`,
    payload,
  )
  return data
}

export async function assignOratorioTeamMember(
  oratorioId: string,
  teamType: OratorioTeamType,
  memberId: string,
): Promise<void> {
  await api.put(
    `/oratorios/${oratorioId}/teams/${teamType}/members/${memberId}`,
  )
}

export async function removeOratorioTeamMember(
  oratorioId: string,
  teamType: OratorioTeamType,
  memberId: string,
): Promise<void> {
  await api.delete(
    `/oratorios/${oratorioId}/teams/${teamType}/members/${memberId}`,
  )
}

export async function lockOratorio(oratorioId: string): Promise<void> {
  await api.patch(`/oratorios/${oratorioId}/lock`)
}

export async function finalizeOratorio(oratorioId: string): Promise<void> {
  await api.patch(`/oratorios/${oratorioId}/finalize`)
}

export async function cancelOratorio(
  oratorioId: string,
  payload: OratorioReason,
): Promise<void> {
  await api.patch(`/oratorios/${oratorioId}/cancel`, payload)
}

export async function reopenOratorio(
  oratorioId: string,
  targetStatus: OratorioReopenTarget,
  payload: OratorioReason,
): Promise<void> {
  await api.patch(`/oratorios/${oratorioId}/reopen`, {
    ...payload,
    targetStatus,
  })
}

export async function removeOratorio(
  oratorioId: string,
  payload: OratorioReason,
): Promise<void> {
  await api.delete(`/oratorios/${oratorioId}`, { data: payload })
}

export async function getAttendanceRoster(
  oratorioId: string,
  kind: AttendanceKind,
  page: number,
  name: string,
  signal?: AbortSignal,
): Promise<AttendanceRosterPage> {
  const { data } = await api.get<AttendanceRosterPage>(
    `/oratorios/${oratorioId}/attendance/${kind}`,
    {
      params: {
        page,
        ...(name.trim() ? { name: name.trim() } : {}),
      },
      ...(signal ? { signal } : {}),
    },
  )
  return data
}

export async function getPresentSummary(
  oratorioId: string,
  signal?: AbortSignal,
): Promise<PresentSummary> {
  const path = `/oratorios/${oratorioId}/attendance/present`
  const { data } = signal
    ? await api.get<PresentSummary>(path, { signal })
    : await api.get<PresentSummary>(path)
  return data
}

export async function markAttendance(
  oratorioId: string,
  kind: AttendanceKind,
  personId: string,
): Promise<Attendance> {
  const { data } = await api.put<Attendance>(
    `/oratorios/${oratorioId}/attendance/${kind}/${personId}`,
  )
  return data
}

export async function uncheckAttendance(
  oratorioId: string,
  kind: AttendanceKind,
  personId: string,
  reason?: string,
): Promise<void> {
  await api.delete(
    `/oratorios/${oratorioId}/attendance/${kind}/${personId}`,
    {
      ...(reason ? { data: { reason } satisfies OratorioReason } : {}),
    },
  )
}

export async function registerAndMarkOratoriano(
  oratorioId: string,
  payload: RegisterOratoriano,
): Promise<QuickRegistration> {
  const { data } = await api.post<QuickRegistration>(
    `/oratorios/${oratorioId}/attendance/oratorianos/register-and-mark`,
    payload,
  )
  return data
}
