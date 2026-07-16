import type { SolicitationStatus } from './api/solicitations'

export const solicitationQueryKeys = {
  all: ['membership-solicitations'] as const,
  search: (status: SolicitationStatus | 'ALL', page: number) =>
    [...solicitationQueryKeys.all, 'search', status, page] as const,
  detail: (id: string) => [...solicitationQueryKeys.all, 'detail', id] as const,
}
