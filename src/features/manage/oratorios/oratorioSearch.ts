import type {
  SearchFilter,
  SortCriteria,
} from '@/components/SearchAndFilter'
import type { EventSearch } from '@/features/manage/events'

import { toEventSearch } from '../events/eventSearchConfig'
import { parseOratorioDateRange } from './dateSearch'

export type OratorioSearch = {
  eventSearch: EventSearch
  partialDateTerm: string
}

function getDateSearchTerm(filters: SearchFilter[]): string {
  const dateFilter = filters.find(
    (filter) =>
      filter.field === 'beginDate'
      && filter.comparisonMethod === 'LIKE'
      && typeof filter.value === 'string',
  )

  return typeof dateFilter?.value === 'string'
    ? dateFilter.value.trim()
    : ''
}

export function toOratorioSearch(
  filters: SearchFilter[],
  sorts: SortCriteria[],
): OratorioSearch {
  const dateTerm = getDateSearchTerm(filters)
  const eventSearch = toEventSearch(
    filters.filter((filter) => filter.field !== 'beginDate'),
    sorts,
    'ORATORIO',
  )
  const dateRange = parseOratorioDateRange(dateTerm)

  if (dateRange) {
    return {
      eventSearch: {
        ...eventSearch,
        filters: {
          ...eventSearch.filters,
          beginDateFrom: dateRange.from,
          beginDateTo: dateRange.to,
        },
      },
      partialDateTerm: '',
    }
  }

  return {
    eventSearch,
    partialDateTerm: dateTerm,
  }
}
