import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { searchMembers } from '../api/searchMembers'
import { memberQueryKeys } from '../queryKeys'
import type { MemberPage, PageParams, SpecificationFilter } from '../types'

type UseSearchMembersOptions = {
  filters: SpecificationFilter[]
  pageParams: PageParams
  enabled?: boolean
}

export function useSearchMembers({
  filters,
  pageParams,
  enabled = true,
}: UseSearchMembersOptions) {
  return useQuery<MemberPage>({
    queryKey: memberQueryKeys.search(filters, pageParams),
    queryFn: () => searchMembers(filters, pageParams),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 1,
    enabled,
  })
}
