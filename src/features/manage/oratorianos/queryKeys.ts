export const oratorianoQueryKeys = {
  all: ['oratorianos'] as const,
  lists: () => [...oratorianoQueryKeys.all, 'list'] as const,
  list: (name: string, page: number) =>
    [...oratorianoQueryKeys.lists(), { name, page }] as const,
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
