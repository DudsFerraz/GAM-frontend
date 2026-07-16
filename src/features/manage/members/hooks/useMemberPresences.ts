import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { getMemberPresences } from '../api/getMemberPresences'
import { memberQueryKeys } from '../queryKeys'

export function useMemberPresences(memberId: string, page: number) {
  return useQuery({
    queryKey: memberQueryKeys.presences(memberId, page),
    queryFn: () => getMemberPresences(memberId, page),
    enabled: Boolean(memberId),
    placeholderData: keepPreviousData,
  })
}
