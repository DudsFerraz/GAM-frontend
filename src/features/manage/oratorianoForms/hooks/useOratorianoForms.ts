import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useCallback, useRef, useSyncExternalStore } from 'react'

import {
  createOratorianoForm,
  deleteOratorianoFormDraft,
  getOratorianoFormDetail,
  getOratorianoFormHistory,
  replaceOratorianoFormDraft,
} from '../api/oratorianoForms'
import {
  disableOratorianoFormDetail,
  isOratorianoFormDetailDisabled,
  subscribeToOratorianoFormDetailState,
} from '../detailState'
import { parseOratorianoFormDetail } from '../parseFormDetail'
import {
  ORATORIANO_FORM_HISTORY_PAGE_SIZE,
  oratorianoFormQueryKeys,
} from '../queryKeys'
import type {
  OratorianoFormDraft,
  OratorianoFormOrigin,
  OratorianoFormReason,
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
  disabled = false,
) {
  const detailDisabled = useSyncExternalStore(
    subscribeToOratorianoFormDetailState,
    () => isOratorianoFormDetailDisabled(oratorianoId, formId),
    () => false,
  )

  return useQuery({
    queryKey: oratorianoFormQueryKeys.detail(oratorianoId, formId),
    queryFn: () => getOratorianoFormDetail(oratorianoId, formId),
    enabled: Boolean(oratorianoId)
      && Boolean(formId)
      && canView
      && openedExplicitly
      && !disabled
      && !detailDisabled,
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

type DeleteOratorianoFormDraftOptions = {
  onDeleted?: () => Promise<void> | void
}

export function useDeleteOratorianoFormDraft(
  oratorianoId: string,
  formId: string,
  options: DeleteOratorianoFormDraftOptions = {},
) {
  const queryClient = useQueryClient()
  const detailKey = oratorianoFormQueryKeys.detail(oratorianoId, formId)
  const submissionInFlight = useRef(false)

  const mutation = useMutation({
    mutationFn: (payload: OratorianoFormReason) => (
      deleteOratorianoFormDraft(oratorianoId, formId, payload)
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
    onSuccess: async () => {
      disableOratorianoFormDetail(oratorianoId, formId)
      await queryClient.cancelQueries({ exact: true, queryKey: detailKey })
      await queryClient.invalidateQueries({
        queryKey: oratorianoFormQueryKeys.histories(),
      })
      await options.onDeleted?.()
    },
  })

  const guardedMutate: typeof mutation.mutate = useCallback(
    (variables, mutateOptions) => {
      if (submissionInFlight.current || mutation.isPending) return

      submissionInFlight.current = true
      mutation.mutate(variables, {
        ...mutateOptions,
        onSettled: (
          data,
          error,
          settledVariables,
          onMutateResult,
          context,
        ) => {
          submissionInFlight.current = false
          mutateOptions?.onSettled?.(
            data,
            error,
            settledVariables,
            onMutateResult,
            context,
          )
        },
      })
    },
    [mutation],
  )

  return { ...mutation, mutate: guardedMutate }
}

export function isConflictError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 409
}
