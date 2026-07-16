import type { EventFilters } from './api/events'

export const eventQueryKeys = {
  all: ['events'] as const,
  search: (filters: EventFilters, page: number) => [...eventQueryKeys.all, 'search', filters, page] as const,
  detail: (eventId: string) => [...eventQueryKeys.all, 'detail', eventId] as const,
  presences: (eventId: string, page: number) => [...eventQueryKeys.detail(eventId), 'presences', page] as const,
}
