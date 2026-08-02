import {
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query'

import {
  eventQueryKeys,
  searchEvents,
  type Event,
  type EventPage,
} from '@/features/manage/events'

import {
  matchesOratorioDateSearch,
} from '../dateSearch'
import type { OratorioSearch } from '../oratorioSearch'

const ORATORIO_PAGE_SIZE = 12
const BACKEND_PAGE_SIZE = 100

export async function getAllOratorioEvents(
  search: OratorioSearch['eventSearch'],
  signal?: AbortSignal,
): Promise<Event[]> {
  const events: Event[] = []
  let page = 0

  while (true) {
    const response = signal
      ? await searchEvents(search, page, BACKEND_PAGE_SIZE, signal)
      : await searchEvents(search, page, BACKEND_PAGE_SIZE)
    const items = response.items ?? []
    events.push(...items)

    if (items.length === 0 || response.last === true) {
      return events
    }

    if (
      typeof response.totalPages === 'number'
      && page + 1 >= response.totalPages
    ) {
      return events
    }

    if (
      typeof response.totalPages !== 'number'
      && items.length < BACKEND_PAGE_SIZE
    ) {
      return events
    }

    page += 1
  }
}

export function paginateOratorioEvents(
  events: Event[],
  page: number,
): EventPage {
  const totalElements = events.length
  const totalPages = Math.ceil(totalElements / ORATORIO_PAGE_SIZE)
  const start = page * ORATORIO_PAGE_SIZE

  return {
    items: events.slice(start, start + ORATORIO_PAGE_SIZE),
    page,
    size: ORATORIO_PAGE_SIZE,
    totalElements,
    totalPages,
  }
}

export function useOratorioSearch(
  search: OratorioSearch,
  page: number,
  enabled = true,
) {
  const isPartialDateSearch = Boolean(search.partialDateTerm)

  const regularQuery = useQuery({
    queryKey: eventQueryKeys.search(search.eventSearch, page),
    queryFn: ({ signal }) => searchEvents(search.eventSearch, page, 12, signal),
    enabled: enabled && !isPartialDateSearch,
    placeholderData: keepPreviousData,
  })

  const partialQuery = useQuery({
    queryKey: eventQueryKeys.oratorioDateSearch(
      search.eventSearch,
      search.partialDateTerm,
    ),
    queryFn: async ({ signal }) => {
      const events = await getAllOratorioEvents(search.eventSearch, signal)
      return events.filter((event) =>
        matchesOratorioDateSearch(
          event.beginDate,
          search.partialDateTerm,
        ),
      )
    },
    enabled: enabled && isPartialDateSearch,
    placeholderData: keepPreviousData,
    select: (events) => paginateOratorioEvents(events, page),
  })

  return isPartialDateSearch ? partialQuery : regularQuery
}
