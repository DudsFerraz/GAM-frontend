import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateMemberStatus } from '../api/updateMemberStatus'
import { memberQueryKeys } from '../queryKeys'

type UpdateMemberStatusVariables = {
  memberId: string
  status: 'ACTIVE' | 'INACTIVE'
  reason: string
}

export function useUpdateMemberStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ memberId, status, reason }: UpdateMemberStatusVariables) =>
      updateMemberStatus(memberId, status, { reason }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.all }),
  })
}
