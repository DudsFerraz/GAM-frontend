import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getSolicitation,
  reviewSolicitation,
  searchSolicitations,
  submitSolicitation,
  type SolicitationStatus,
} from '../api/solicitations'
import { solicitationQueryKeys } from '../queryKeys'

export function useSolicitations(status: SolicitationStatus | 'ALL', page: number) {
  return useQuery({
    queryKey: solicitationQueryKeys.search(status, page),
    queryFn: () => searchSolicitations(status, page),
    placeholderData: keepPreviousData,
  })
}

export function useSolicitation(id: string | null) {
  return useQuery({
    queryKey: solicitationQueryKeys.detail(id ?? ''),
    queryFn: () => getSolicitation(id ?? ''),
    enabled: Boolean(id),
  })
}

export function useSubmitSolicitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitSolicitation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: solicitationQueryKeys.all }),
  })
}

export function useReviewSolicitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, decision, reason }: { id: string; decision: 'approve' | 'reject'; reason: string }) =>
      reviewSolicitation(id, decision, reason),
    onSuccess: (solicitation) => {
      void queryClient.invalidateQueries({ queryKey: solicitationQueryKeys.all })
      if (solicitation.id) {
        queryClient.setQueryData(solicitationQueryKeys.detail(solicitation.id), solicitation)
      }
    },
  })
}
