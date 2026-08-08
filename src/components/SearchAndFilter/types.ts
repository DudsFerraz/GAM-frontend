import type { components } from '@/api/generated/gam-api'

export type SearchFilter =
  components['schemas']['SpecificationFilterDTO']

export type SearchFilterValue = SearchFilter['value']
export type ComparisonMethod = SearchFilter['comparisonMethod']
export type FilterValueValidator = (
  value: SearchFilterValue,
  comparisonMethod: ComparisonMethod,
) => string | undefined

export type SortDirection = 'ASC' | 'DESC'

export type SortCriteria = {
  field: string
  direction: SortDirection
}

export type FilterInputType = 'text' | 'date' | 'select'

export type FilterOption = {
  label: string
  value: SearchFilterValue
}

export interface FieldConfig {
  key: string
  label: string
  inputType: FilterInputType
  options?: FilterOption[]
  allowedOperators?: ComparisonMethod[]
  filterable?: boolean
  sortable?: boolean
  validateValue?: FilterValueValidator
}

export interface SearchAndFilterProps {
  config: FieldConfig[]
  mainFilterField: string
  onSearch: (filters: SearchFilter[], sorts: SortCriteria[]) => void
  className?: string
}
