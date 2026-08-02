import type { OratorianoSearch } from './api/oratorianos'

export const oratorianoQueryKeys = {
  all: ['oratorianos'] as const,
  lists: () => [...oratorianoQueryKeys.all, 'list'] as const,
  list: (search: OratorianoSearch, page: number) =>
    [...oratorianoQueryKeys.lists(), { search, page }] as const,
  details: () => [...oratorianoQueryKeys.all, 'detail'] as const,
  detail: (oratorianoId: string) =>
    [...oratorianoQueryKeys.details(), oratorianoId] as const,
  attendances: (oratorianoId: string, page: number) =>
    [...oratorianoQueryKeys.detail(oratorianoId), 'attendances', page] as const,
  summary: (
    oratorianoId: string,
    year?: number,
    month?: number,
  ) => [
    ...oratorianoQueryKeys.detail(oratorianoId),
    'attendance-summary',
    { month, year },
  ] as const,
}
