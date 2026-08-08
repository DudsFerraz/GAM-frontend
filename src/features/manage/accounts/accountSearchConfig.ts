import {
  createTrimmedTextMaxLengthValidator,
  validateEmailSearchValue,
  type FieldConfig,
  type SearchFilter,
  type SortCriteria,
} from '@/components/SearchAndFilter'

import type { AccountSearch } from './api/accounts'

const validateDisplayNameSearch = createTrimmedTextMaxLengthValidator(
  50,
  'Digite no máximo 50 caracteres para pesquisar por nome de exibição.',
)

export const ACCOUNT_SEARCH_CONFIG: FieldConfig[] = [
  {
    key: 'displayName',
    label: 'Nome de exibição',
    inputType: 'text',
    allowedOperators: ['LIKE'],
    filterable: false,
    sortable: true,
    validateValue: validateDisplayNameSearch,
  },
  {
    key: 'email',
    label: 'E-mail',
    inputType: 'text',
    allowedOperators: ['LIKE', 'EQUALS'],
    sortable: true,
    validateValue: validateEmailSearchValue,
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
