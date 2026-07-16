import type { PageParams, SpecificationFilter } from './types'

export const memberQueryKeys = {
  all: ['members'] as const,
  search: (filters: SpecificationFilter[], pageParams: PageParams) =>
    [...memberQueryKeys.all, 'search', filters, pageParams] as const,
}
