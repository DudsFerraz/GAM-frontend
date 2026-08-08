import { useMutation, useQueryClient } from '@tanstack/react-query'

import { accountAdminQueryKeys } from '@/features/manage/accounts'

import { updateMemberOratorioCoordinator } from '../api/updateMemberOratorioCoordinator'
import { memberQueryKeys } from '../queryKeys'

type UpdateMemberOratorioCoordinatorVariables = {
  accountId: string
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
    onSuccess: async (_data, { accountId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: memberQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: accountAdminQueryKeys.roles(accountId),
        }),
        queryClient.invalidateQueries({
          queryKey: [...accountAdminQueryKeys.all, 'search'],
        }),
      ])
    },
  })
}
