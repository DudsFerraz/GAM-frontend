import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createMember } from '../api/createMember'
import { memberQueryKeys } from '../queryKeys'

export function useCreateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMember,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberQueryKeys.all }),
  })
}
