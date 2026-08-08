import type { components } from '@/api/generated/gam-api'
import type { SearchFilter } from '@/components/SearchAndFilter'
import { normalizeAccountRoles } from '@/features/account'
import { api } from '@/lib/http'

type AccountTransport = components['schemas']['AccountRDTO']
type AccountPageTransport = components['schemas']['PagedResponseAccountRDTO']
export type Account = Omit<AccountTransport, 'roles'> & { roles: Role[] }
export type AccountPage = Omit<AccountPageTransport, 'items'> & { items?: Account[] }
export type AccountRoles = { roles: Role[] }
export type Role = components['schemas']['RoleRDTO']

export type AccountSearch = {
  filters: SearchFilter[]
  sorts: string[]
}

const ACCOUNT_SORT_FIELDS = ['email', 'displayName', 'createdAt'] as const

function isSupportedAccountSort(value: string): boolean {
  const [field, direction, ...rest] = value.split(',')
  return (
    rest.length === 0 &&
    ACCOUNT_SORT_FIELDS.some((allowedField) => allowedField === field) &&
    (direction === 'asc' || direction === 'desc')
  )
}

function isSupportedAccountFilter(filter: SearchFilter): boolean {
  return (
    (filter.field === 'displayName' || filter.field === 'email') &&
    (filter.comparisonMethod === 'LIKE' ||
      filter.comparisonMethod === 'EQUALS') &&
    (typeof filter.value === 'string'
      ? filter.value.trim().length > 0
      : filter.value.length > 0)
  )
}

export async function searchAccounts(search: AccountSearch, page: number): Promise<AccountPage> {
  const filters = search.filters
    .filter(isSupportedAccountFilter)
    .map((filter) => ({
      ...filter,
      value: typeof filter.value === 'string'
        ? filter.value.trim()
        : filter.value,
    }))
  const requestedSorts = search.sorts.filter(isSupportedAccountSort)
  const { data } = await api.post<AccountPageTransport>('/accounts/search', { filters }, {
    params: {
      page,
      size: 10,
      sort: requestedSorts.length > 0 ? requestedSorts : ['displayName,asc'],
    },
    paramsSerializer: { indexes: null },
  })
  return {
    ...data,
    items: (data.items ?? []).map((account) => ({
      ...account,
      roles: normalizeAccountRoles(account.roles),
    })),
  }
}

export async function getAccountRoles(accountId: string): Promise<AccountRoles> {
  const { data } = await api.get<unknown>(`/accounts/${accountId}/roles`)
  return { roles: normalizeAccountRoles(data) }
}
