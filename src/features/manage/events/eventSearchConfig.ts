import type {
  FieldConfig,
  SearchFilter,
  SortCriteria,
} from '@/components/SearchAndFilter'

import type {
  EventFilters,
  EventSearch,
  EventStatus,
  EventType,
} from './api/events'
import {
  EVENT_STATUS_LABELS,
  EVENT_TYPE_PRESENTATIONS,
} from './presentation'

const INITIAL_EVENT_FILTERS: EventFilters = {
  title: '',
  status: 'ALL',
  type: 'ALL',
}

export const EVENT_SEARCH_CONFIG: FieldConfig[] = [
  {
    key: 'title',
    label: 'Título',
    inputType: 'text',
    allowedOperators: ['LIKE'],
    filterable: false,
    sortable: true,
  },
  {
    key: 'status',
    label: 'Situação',
    inputType: 'select',
    options: [
      ...Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
    ],
    allowedOperators: ['EQUALS'],
    sortable: true,
  },
  {
    key: 'type',
    label: 'Tipo',
    inputType: 'select',
    options: Object.entries(EVENT_TYPE_PRESENTATIONS).map(
      ([value, presentation]) => ({
        label: presentation.label,
        value,
      }),
    ),
    allowedOperators: ['EQUALS'],
    sortable: true,
  },
  {
    key: 'beginDate',
    label: 'Início',
    inputType: 'date',
    filterable: false,
    sortable: true,
  },
  {
    key: 'endDate',
    label: 'Término',
    inputType: 'date',
    filterable: false,
    sortable: true,
  },
]

export const ORATORIO_SEARCH_CONFIG = EVENT_SEARCH_CONFIG.filter(
  (field) => field.key !== 'type',
)

function getEventStatus(value: string): EventStatus | 'ALL' {
  return value in EVENT_STATUS_LABELS
    ? (value as EventStatus)
    : 'ALL'
}

function getEventType(value: string): EventType | 'ALL' {
  return value in EVENT_TYPE_PRESENTATIONS
    ? (value as EventType)
    : 'ALL'
}

export function toEventSearch(
  filters: SearchFilter[],
  sorts: SortCriteria[],
  fixedType?: EventType,
): EventSearch {
  const result: EventFilters = {
    ...INITIAL_EVENT_FILTERS,
    ...(fixedType ? { type: fixedType } : {}),
  }

  for (const filter of filters) {
    if (typeof filter.value !== 'string') {
      continue
    }

    if (filter.field === 'title' && filter.comparisonMethod === 'LIKE') {
      result.title = filter.value
    }
    if (filter.field === 'status' && filter.comparisonMethod === 'EQUALS') {
      result.status = getEventStatus(filter.value)
    }
    if (filter.field === 'type' && filter.comparisonMethod === 'EQUALS') {
      result.type = getEventType(filter.value)
    }
  }

  return {
    filters: result,
    sorts: sorts.map(
      (sort) => `${sort.field},${sort.direction.toLowerCase()}`,
    ),
  }
}
