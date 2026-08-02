import type {
  FieldConfig,
  SearchFilter,
  SortCriteria,
} from '@/components/SearchAndFilter'

import type { OratorianoSearch } from './api/oratorianos'

export const ORATORIANO_SEARCH_CONFIG: FieldConfig[] = [
  {
    key: 'name',
    label: 'Nome',
    inputType: 'text',
    allowedOperators: ['LIKE'],
    filterable: false,
    sortable: false,
  },
  {
    key: 'oratorioYearAttendances',
    label: 'Frequência anual',
    inputType: 'text',
    filterable: false,
    sortable: true,
  },
]

export function toOratorianoSearch(
  filters: SearchFilter[],
  sorts: SortCriteria[],
): OratorianoSearch {
  return {
    filters,
    sorts: sorts.map(
      (sort) => `${sort.field},${sort.direction.toLowerCase()}`,
    ),
  }
}
