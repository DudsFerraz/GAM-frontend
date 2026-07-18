import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { searchMembers } from '../api/searchMembers'
import { memberQueryKeys } from '../queryKeys'
import type { MemberPage, PageParams, SpecificationFilter } from '../types'

type UseSearchMembersOptions = {
  filters: SpecificationFilter[]
  pageParams: PageParams
  showInactive: boolean
  enabled?: boolean
}

export function useSearchMembers({
  filters,
  pageParams,
  showInactive,
  enabled = true,
}: UseSearchMembersOptions) {
  return useQuery<MemberPage>({
    queryKey: memberQueryKeys.search(filters, pageParams, showInactive),
    queryFn: () => searchMembers(filters, pageParams, showInactive),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 1,
    enabled,
  })
}
