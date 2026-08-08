import { keepPreviousData, useQuery } from '@tanstack/react-query'

import {
  getAccountRoles,
  searchAccounts,
  type AccountSearch,
} from '../api/accounts'
import { accountAdminQueryKeys } from '../queryKeys'

export function useSearchAccounts(search: AccountSearch, page: number, enabled = true) {
  return useQuery({ queryKey: accountAdminQueryKeys.search(search, page), queryFn: () => searchAccounts(search, page), placeholderData: keepPreviousData, enabled })
}

export function useAccountRoles(accountId: string | null, enabled = true) {
  return useQuery({ queryKey: accountAdminQueryKeys.roles(accountId ?? ''), queryFn: () => getAccountRoles(accountId ?? ''), enabled: Boolean(accountId) && enabled })
}
