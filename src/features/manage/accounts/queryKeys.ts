import type { AccountSearch } from './api/accounts'

// Query keys for account administration
// These keys are used to identify and manage queries related to account administration in the application. 
// They help in caching, invalidating, and refetching data efficiently.
export const accountAdminQueryKeys = {
  all: ['account-administration'] as const,
  search: (search: AccountSearch, page: number) => [...accountAdminQueryKeys.all, 'search', search, page] as const,
  roles: (accountId: string) => [...accountAdminQueryKeys.all, accountId, 'roles'] as const,
}
