import { useQuery } from '@tanstack/react-query'

import { findMemberByAccountEmail } from '../api/findMemberByAccountEmail'
import { memberQueryKeys } from '../queryKeys'

export function useMemberByAccountEmail(email: string | null, enabled = true) {
  return useQuery({
    queryKey: memberQueryKeys.accountEmail(email ?? ''),
    queryFn: () => findMemberByAccountEmail(email ?? ''),
    enabled: enabled && Boolean(email),
  })
}
