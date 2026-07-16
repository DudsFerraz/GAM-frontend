import type { PageParams, SpecificationFilter } from './types'

export const memberQueryKeys = {
  all: ['members'] as const,
  details: () => [...memberQueryKeys.all, 'detail'] as const,
  detail: (memberId: string) => [...memberQueryKeys.details(), memberId] as const,
  presences: (memberId: string, page: number) =>
    [...memberQueryKeys.detail(memberId), 'presences', page] as const,
  search: (filters: SpecificationFilter[], pageParams: PageParams) =>
    [...memberQueryKeys.all, 'search', filters, pageParams] as const,
}
