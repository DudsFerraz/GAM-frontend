import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { AxiosError } from 'axios'

import {
  createOratorianoForm,
  getOratorianoFormDetail,
  getOratorianoFormHistory,
  replaceOratorianoFormDraft,
} from '../api/oratorianoForms'
import { parseOratorianoFormDetail } from '../parseFormDetail'
import {
  ORATORIANO_FORM_HISTORY_PAGE_SIZE,
  oratorianoFormQueryKeys,
} from '../queryKeys'
import type {
  OratorianoFormDraft,
  OratorianoFormOrigin,
} from '../types'

export function useOratorianoFormHistory(
  oratorianoId: string,
  page: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: oratorianoFormQueryKeys.history(
      oratorianoId,
      page,
      ORATORIANO_FORM_HISTORY_PAGE_SIZE,
    ),
    queryFn: () => getOratorianoFormHistory(
      oratorianoId,
      page,
      ORATORIANO_FORM_HISTORY_PAGE_SIZE,
    ),
    enabled: Boolean(oratorianoId) && enabled,
    placeholderData: keepPreviousData,
  })
}

export function useOratorianoFormDetail(
  oratorianoId: string,
  formId: string,
  canView: boolean,
  openedExplicitly: boolean,
) {
  return useQuery({
    queryKey: oratorianoFormQueryKeys.detail(oratorianoId, formId),
    queryFn: () => getOratorianoFormDetail(oratorianoId, formId),
    enabled: Boolean(oratorianoId)
      && Boolean(formId)
      && canView
      && openedExplicitly,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    select: parseOratorianoFormDetail,
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export function useCreateOratorianoForm(oratorianoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (origin: OratorianoFormOrigin) => (
      parseOratorianoFormDetail(
        await createOratorianoForm(oratorianoId, origin),
      )
    ),
    onSuccess: async (detail) => {
      if (detail.id) {
        queryClient.setQueryData(
          oratorianoFormQueryKeys.detail(oratorianoId, detail.id),
          detail,
        )
      }
      await queryClient.invalidateQueries({
        queryKey: oratorianoFormQueryKeys.histories(),
      })
    },
  })
}

export function useReplaceOratorianoFormDraft(
  oratorianoId: string,
  formId: string,
) {
  const queryClient = useQueryClient()
  const detailKey = oratorianoFormQueryKeys.detail(oratorianoId, formId)
  return useMutation({
    mutationFn: async (draft: OratorianoFormDraft) => (
      parseOratorianoFormDetail(
        await replaceOratorianoFormDraft(oratorianoId, formId, draft),
      )
    ),
    onError: async (error) => {
      if (!isConflictError(error)) return
      await queryClient.invalidateQueries({
        exact: true,
        queryKey: detailKey,
        refetchType: 'none',
      })
      await queryClient.refetchQueries({ exact: true, queryKey: detailKey })
    },
    onSuccess: async (detail) => {
      queryClient.setQueryData(detailKey, detail)
      await queryClient.invalidateQueries({
        queryKey: oratorianoFormQueryKeys.histories(),
      })
    },
  })
}

export function isConflictError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 409
}
