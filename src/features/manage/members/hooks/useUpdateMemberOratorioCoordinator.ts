import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateMemberOratorioCoordinator } from '../api/updateMemberOratorioCoordinator'
import { memberQueryKeys } from '../queryKeys'

type UpdateMemberOratorioCoordinatorVariables = {
  memberId: string
  action: 'grant' | 'revoke'
  reason: string
}

export function useUpdateMemberOratorioCoordinator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      memberId,
      action,
      reason,
    }: UpdateMemberOratorioCoordinatorVariables) =>
      updateMemberOratorioCoordinator(memberId, action, { reason }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.all }),
  })
}
