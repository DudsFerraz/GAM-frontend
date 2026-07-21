import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateMemberCoordinator } from '../api/updateMemberCoordinator'
import { memberQueryKeys } from '../queryKeys'

type UpdateMemberCoordinatorVariables = {
  memberId: string
  action: 'grant' | 'revoke'
  reason: string
}

export function useUpdateMemberCoordinator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ memberId, action, reason }: UpdateMemberCoordinatorVariables) =>
      updateMemberCoordinator(memberId, action, { reason }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.all }),
  })
}
