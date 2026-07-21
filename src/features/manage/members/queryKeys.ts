import type { PageParams, SpecificationFilter } from './types'

export const memberQueryKeys = {
  all: ['members'] as const,
  details: () => [...memberQueryKeys.all, 'detail'] as const,
  detail: (memberId: string) => [...memberQueryKeys.details(), memberId] as const,
  accountEmail: (email: string) => [...memberQueryKeys.all, 'account-email', email] as const,
  presences: (memberId: string, page: number) =>
    [...memberQueryKeys.detail(memberId), 'presences', page] as const,
  search: (filters: SpecificationFilter[], pageParams: PageParams, showInactive: boolean) =>
    [...memberQueryKeys.all, 'search', filters, pageParams, showInactive] as const,
}
