import { useQuery } from '@tanstack/react-query'

import { getMember } from '../api/getMember'
import { memberQueryKeys } from '../queryKeys'

export function useMember(memberId: string) {
  return useQuery({
    queryKey: memberQueryKeys.detail(memberId),
    queryFn: () => getMember(memberId),
    enabled: Boolean(memberId),
  })
}
