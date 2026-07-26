import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'

import {
  eventQueryKeys,
} from '@/features/manage/events'
import {
  areHumanEquivalentNames,
  oratorianoQueryKeys,
} from '@/features/manage/oratorianos'

import {
  assignOratorioTeamMember,
  cancelOratorio,
  createOratorio,
  finalizeOratorio,
  getAttendanceRoster,
  getOratorio,
  getPresentSummary,
  lockOratorio,
  markAttendance,
  registerAndMarkOratoriano,
  removeOratorio,
  removeOratorioTeamMember,
  reopenOratorio,
  replaceOratorioPlanning,
  uncheckAttendance,
  type Attendance,
  type AttendanceKind,
  type AttendanceRosterPage,
  type CreateOratorio,
  type OratorioPlanning,
  type OratorioTeamType,
  type PresentSummary,
  type RegisterOratoriano,
} from '../api/oratorios'
import { oratorioQueryKeys } from '../queryKeys'

export type OratorioLifecycleCommand =
  | { action: 'lock' | 'finalize'; oratorioId: string }
  | { action: 'cancel'; oratorioId: string; reason: string }
  | {
      action: 'reopen'
      oratorioId: string
      reason: string
      targetStatus: 'COMPLETED' | 'LOCKED'
    }

async function invalidateOratorioDetailAndEvents(
  queryClient: QueryClient,
  oratorioId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: oratorioQueryKeys.detail(oratorioId),
    }),
    queryClient.invalidateQueries({ queryKey: eventQueryKeys.all }),
  ])
}

async function invalidateAttendance(
  queryClient: QueryClient,
  oratorioId: string,
  kind: AttendanceKind,
  personId?: string,
) {
  const invalidations = [
    queryClient.invalidateQueries({
      queryKey: oratorioQueryKeys.rosters(oratorioId, kind),
    }),
    queryClient.invalidateQueries({
      queryKey: oratorioQueryKeys.present(oratorioId),
    }),
  ]

  if (kind === 'oratorianos' && personId) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: oratorianoQueryKeys.detail(personId),
      }),
      queryClient.invalidateQueries({
        queryKey: oratorioQueryKeys.exactOratorianoNames(oratorioId),
      }),
    )
  }

  await Promise.all(invalidations)
}

function updateRosterAttendance(
  page: AttendanceRosterPage | undefined,
  personId: string,
  attendance: Attendance | undefined,
): AttendanceRosterPage | undefined {
  if (!page?.items) return page

  return {
    ...page,
    items: page.items.map((entry) =>
      entry.person?.id === personId
        ? { ...entry, attendance }
        : entry,
    ),
  }
}

function updatePresentSummary(
  summary: PresentSummary | undefined,
  kind: AttendanceKind,
  personId: string,
  attendance: Attendance | undefined,
): PresentSummary | undefined {
  if (!summary) return undefined

  const key = kind
  const current = summary[key] ?? []
  const remaining = current.filter(
    (item) => item.person?.id !== personId,
  )

  return {
    ...summary,
    [key]: attendance ? [...remaining, attendance] : remaining,
  }
}

export function useOratorio(oratorioId: string, enabled = true) {
  return useQuery({
    queryKey: oratorioQueryKeys.detail(oratorioId),
    queryFn: () => getOratorio(oratorioId),
    enabled: Boolean(oratorioId) && enabled,
  })
}

export function useCreateOratorio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateOratorio) => createOratorio(payload),
    onSuccess: (oratorio) => {
      if (oratorio.id) {
        queryClient.setQueryData(
          oratorioQueryKeys.detail(oratorio.id),
          oratorio,
        )
      }
      return queryClient.invalidateQueries({
        queryKey: eventQueryKeys.all,
      })
    },
  })
}

export function useReplaceOratorioPlanning() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      oratorioId,
      payload,
    }: {
      oratorioId: string
      payload: OratorioPlanning
    }) => replaceOratorioPlanning(oratorioId, payload),
    onSuccess: (oratorio, { oratorioId }) => {
      queryClient.setQueryData(
        oratorioQueryKeys.detail(oratorioId),
        oratorio,
      )
    },
  })
}

export function useAssignOratorioTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      memberId,
      oratorioId,
      teamType,
    }: {
      memberId: string
      oratorioId: string
      teamType: OratorioTeamType
    }) => assignOratorioTeamMember(oratorioId, teamType, memberId),
    onSuccess: (_, { oratorioId }) =>
      queryClient.invalidateQueries({
        queryKey: oratorioQueryKeys.detail(oratorioId),
      }),
  })
}

export function useRemoveOratorioTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      memberId,
      oratorioId,
      teamType,
    }: {
      memberId: string
      oratorioId: string
      teamType: OratorioTeamType
    }) => removeOratorioTeamMember(oratorioId, teamType, memberId),
    onSuccess: (_, { oratorioId }) =>
      queryClient.invalidateQueries({
        queryKey: oratorioQueryKeys.detail(oratorioId),
      }),
  })
}

export function useOratorioLifecycle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (command: OratorioLifecycleCommand) => {
      switch (command.action) {
        case 'lock':
          return lockOratorio(command.oratorioId)
        case 'finalize':
          return finalizeOratorio(command.oratorioId)
        case 'cancel':
          return cancelOratorio(command.oratorioId, {
            reason: command.reason,
          })
        case 'reopen':
          return reopenOratorio(
            command.oratorioId,
            command.targetStatus,
            { reason: command.reason },
          )
      }
    },
    onSuccess: (_, { oratorioId }) =>
      invalidateOratorioDetailAndEvents(queryClient, oratorioId),
  })
}

export function useRemoveOratorio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      oratorioId,
      reason,
    }: {
      oratorioId: string
      reason: string
    }) => removeOratorio(oratorioId, { reason }),
    onSuccess: (_, { oratorioId }) => {
      queryClient.removeQueries({
        queryKey: oratorioQueryKeys.detail(oratorioId),
      })
      return queryClient.invalidateQueries({
        queryKey: eventQueryKeys.all,
      })
    },
  })
}

export function useAttendanceRoster(
  oratorioId: string,
  kind: AttendanceKind,
  page: number,
  name: string,
  enabled = true,
) {
  return useQuery({
    queryKey: oratorioQueryKeys.roster(
      oratorioId,
      kind,
      page,
      name,
    ),
    queryFn: ({ signal }) =>
      getAttendanceRoster(oratorioId, kind, page, name, signal),
    enabled: Boolean(oratorioId) && enabled,
    placeholderData: keepPreviousData,
  })
}

export function usePresentSummary(
  oratorioId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: oratorioQueryKeys.present(oratorioId),
    queryFn: ({ signal }) => getPresentSummary(oratorioId, signal),
    enabled: Boolean(oratorioId) && enabled,
  })
}

export function useExactOratorianoAttendanceMatch(
  oratorioId: string,
  firstName: string,
  surname: string,
  enabled = true,
) {
  return useQuery({
    queryKey: oratorioQueryKeys.exactOratorianoName(
      oratorioId,
      firstName,
      surname,
    ),
    queryFn: async ({ signal }) => {
      const fullName = `${firstName} ${surname}`
      const firstPage = await getAttendanceRoster(
        oratorioId,
        'oratorianos',
        0,
        fullName,
        signal,
      )
      const firstMatch = firstPage.items?.find((entry) =>
        areHumanEquivalentNames(
          { firstName, surname },
          entry.person ?? {},
        ),
      )
      if (firstMatch) return firstMatch

      const reportedTotalPages = firstPage.totalPages
      const totalPages =
        typeof reportedTotalPages === 'number'
        && Number.isFinite(reportedTotalPages)
          ? Math.max(1, Math.trunc(reportedTotalPages))
          : 1

      for (let page = 1; page < totalPages; page += 1) {
        const roster = await getAttendanceRoster(
          oratorioId,
          'oratorianos',
          page,
          fullName,
          signal,
        )
        const match = roster.items?.find((entry) =>
          areHumanEquivalentNames(
            { firstName, surname },
            entry.person ?? {},
          ),
        )
        if (match) return match
      }

      return null
    },
    enabled:
      Boolean(oratorioId)
      && Boolean(firstName)
      && Boolean(surname)
      && enabled,
  })
}

export function useMarkAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      kind,
      oratorioId,
      personId,
    }: {
      kind: AttendanceKind
      oratorioId: string
      personId: string
    }) => markAttendance(oratorioId, kind, personId),
    onSuccess: (attendance, { kind, oratorioId, personId }) => {
      queryClient.setQueriesData<AttendanceRosterPage>(
        { queryKey: oratorioQueryKeys.rosters(oratorioId, kind) },
        (page) => updateRosterAttendance(page, personId, attendance),
      )
      queryClient.setQueryData<PresentSummary>(
        oratorioQueryKeys.present(oratorioId),
        (summary) =>
          updatePresentSummary(
            summary,
            kind,
            personId,
            attendance,
          ),
      )
    },
    onSettled: (_, __, variables) =>
      invalidateAttendance(
        queryClient,
        variables.oratorioId,
        variables.kind,
        variables.personId,
      ),
  })
}

export function useUncheckAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      kind,
      oratorioId,
      personId,
      reason,
    }: {
      kind: AttendanceKind
      oratorioId: string
      personId: string
      reason?: string
    }) => uncheckAttendance(oratorioId, kind, personId, reason),
    onSuccess: (_, { kind, oratorioId, personId }) => {
      queryClient.setQueriesData<AttendanceRosterPage>(
        { queryKey: oratorioQueryKeys.rosters(oratorioId, kind) },
        (page) => updateRosterAttendance(page, personId, undefined),
      )
      queryClient.setQueryData<PresentSummary>(
        oratorioQueryKeys.present(oratorioId),
        (summary) =>
          updatePresentSummary(summary, kind, personId, undefined),
      )
    },
    onSettled: (_, __, variables) =>
      invalidateAttendance(
        queryClient,
        variables.oratorioId,
        variables.kind,
        variables.personId,
      ),
  })
}

export function useRegisterAndMarkOratoriano() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      oratorioId,
      payload,
    }: {
      oratorioId: string
      payload: RegisterOratoriano
    }) => registerAndMarkOratoriano(oratorioId, payload),
    onSuccess: (result, { oratorioId }) => {
      const personId = result.oratoriano?.id
      if (personId && result.oratoriano) {
        queryClient.setQueryData(
          oratorianoQueryKeys.detail(personId),
          result.oratoriano,
        )
      }
      if (personId && result.attendance) {
        queryClient.setQueryData<PresentSummary>(
          oratorioQueryKeys.present(oratorioId),
          (summary) =>
            updatePresentSummary(
              summary,
              'oratorianos',
              personId,
              result.attendance,
            ),
        )
      }
      void queryClient.invalidateQueries({
        queryKey: oratorianoQueryKeys.lists(),
      })
    },
    onSettled: (result, _, { oratorioId }) =>
      invalidateAttendance(
        queryClient,
        oratorioId,
        'oratorianos',
        result?.oratoriano?.id,
      ),
  })
}
