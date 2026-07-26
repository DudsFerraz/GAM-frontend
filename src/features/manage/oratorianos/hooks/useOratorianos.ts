import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  getOratoriano,
  getOratorianoAttendances,
  getOratorianoAttendanceSummary,
  registerOratoriano,
  replaceOratoriano,
  searchOratorianos,
  type RegisterOratoriano,
  type ReplaceOratoriano,
} from '../api/oratorianos'
import { oratorianoQueryKeys } from '../queryKeys'

export function useOratorianos(
  name: string,
  page: number,
  enabled = true,
) {
  return useQuery({
    queryKey: oratorianoQueryKeys.list(name, page),
    queryFn: () => searchOratorianos(name, page),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useOratoriano(
  oratorianoId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: oratorianoQueryKeys.detail(oratorianoId),
    queryFn: () => getOratoriano(oratorianoId),
    enabled: Boolean(oratorianoId) && enabled,
  })
}

export function useOratorianoAttendances(
  oratorianoId: string,
  page: number,
  enabled = true,
) {
  return useQuery({
    queryKey: oratorianoQueryKeys.attendances(oratorianoId, page),
    queryFn: () => getOratorianoAttendances(oratorianoId, page),
    enabled: Boolean(oratorianoId) && enabled,
    placeholderData: keepPreviousData,
  })
}

export function useOratorianoAttendanceSummary(
  oratorianoId: string,
  year?: number,
  month?: number,
  enabled = true,
) {
  return useQuery({
    queryKey: oratorianoQueryKeys.summary(oratorianoId, year, month),
    queryFn: () =>
      getOratorianoAttendanceSummary(oratorianoId, year, month),
    enabled: Boolean(oratorianoId) && enabled,
  })
}

export function useRegisterOratoriano() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterOratoriano) =>
      registerOratoriano(payload),
    onSuccess: (oratoriano) => {
      if (oratoriano.id) {
        queryClient.setQueryData(
          oratorianoQueryKeys.detail(oratoriano.id),
          oratoriano,
        )
      }
      return queryClient.invalidateQueries({
        queryKey: oratorianoQueryKeys.lists(),
      })
    },
  })
}

export function useReplaceOratoriano() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      oratorianoId,
      payload,
    }: {
      oratorianoId: string
      payload: ReplaceOratoriano
    }) => replaceOratoriano(oratorianoId, payload),
    onSuccess: (oratoriano, { oratorianoId }) => {
      queryClient.setQueryData(
        oratorianoQueryKeys.detail(oratorianoId),
        oratoriano,
      )
      return queryClient.invalidateQueries({
        queryKey: oratorianoQueryKeys.lists(),
      })
    },
  })
}
