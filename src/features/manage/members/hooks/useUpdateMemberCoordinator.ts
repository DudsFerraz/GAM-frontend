import { useMutation, useQueryClient } from '@tanstack/react-query'

import { accountAdminQueryKeys } from '@/features/manage/accounts'

import { updateMemberCoordinator } from '../api/updateMemberCoordinator'
import { memberQueryKeys } from '../queryKeys'

type UpdateMemberCoordinatorVariables = {
  accountId: string
  memberId: string
  action: 'grant' | 'revoke'
  reason: string
}

export function useUpdateMemberCoordinator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ memberId, action, reason }: UpdateMemberCoordinatorVariables) =>
      updateMemberCoordinator(memberId, action, { reason }),
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
