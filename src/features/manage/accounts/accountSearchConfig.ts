import type {
  FieldConfig,
  SearchFilter,
  SortCriteria,
} from '@/components/SearchAndFilter'

import type { AccountSearch } from './api/accounts'

export const ACCOUNT_SEARCH_CONFIG: FieldConfig[] = [
  {
    key: 'displayName',
    label: 'Nome de exibição',
    inputType: 'text',
    allowedOperators: ['LIKE'],
    filterable: false,
    sortable: true,
  },
  {
    key: 'email',
    label: 'E-mail',
    inputType: 'text',
    allowedOperators: ['LIKE', 'EQUALS'],
    sortable: true,
  },
  {
    key: 'createdAt',
    label: 'Data de criação',
    inputType: 'date',
    filterable: false,
    sortable: true,
  },
]

export function toAccountSearch(
  filters: SearchFilter[],
  sorts: SortCriteria[],
): AccountSearch {
  return {
    filters,
    sorts: sorts.map(
      (sort) => `${sort.field},${sort.direction.toLowerCase()}`,
    ),
  }
}
