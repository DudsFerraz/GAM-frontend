import { ArrowUpDown, Filter, Search } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { SearchClearButton } from '@/components/SearchClearButton'
import { Input } from '@/components/ui/Input'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { cn } from '@/lib/utils'

import { SearchFilterPanel } from './SearchFilterPanel'
import { SearchSortPanel } from './SearchSortPanel'
import {
  getAvailableOperators,
  getDefaultOperator,
  isEmptyValue,
} from './searchHelpers'
import type {
  ComparisonMethod,
  SearchAndFilterProps,
  SearchFilter,
  SearchFilterValue,
  SortCriteria,
} from './types'

export function SearchAndFilter({
  className,
  config,
  mainFilterField,
  onSearch,
}: SearchAndFilterProps) {
  const [mainSearchValue, setMainSearchValue] = useState('')
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeSorts, setActiveSorts] = useState<SortCriteria[]>([])
  const [isSortOpen, setIsSortOpen] = useState(false)
  const filterableFields = useMemo(
    () => config.filter((field) => field.filterable !== false),
    [config],
  )
  const sortableFields = useMemo(
    () => config.filter((field) => field.sortable !== false),
    [config],
  )
  const [selectedFieldKey, setSelectedFieldKey] = useState(
    filterableFields[0]?.key ?? '',
  )
  const [selectedOperator, setSelectedOperator] = useState<ComparisonMethod>(
    filterableFields[0] ? getDefaultOperator(filterableFields[0]) : 'LIKE',
  )
  const [filterValue, setFilterValue] = useState<SearchFilterValue>('')
  const filterPanelId = useId()
  const sortPanelId = useId()
  const onSearchRef = useRef(onSearch)
  const searchState = useMemo(
    () => ({ activeFilters, activeSorts, mainSearchValue }),
    [activeFilters, activeSorts, mainSearchValue],
  )
  const debouncedSearchState = useDebouncedValue(searchState)
  const hasMountedSearchState = useRef(false)

  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => {
    if (!hasMountedSearchState.current) {
      hasMountedSearchState.current = true
      return
    }

    const filters = [...debouncedSearchState.activeFilters]
    const normalizedMainSearch = debouncedSearchState.mainSearchValue.trim()

    if (normalizedMainSearch) {
      filters.push({
        field: mainFilterField,
        value: normalizedMainSearch,
        comparisonMethod: 'LIKE',
      })
    }

    // The first render is intentionally silent; only settled user input starts a search.
    onSearchRef.current(filters, debouncedSearchState.activeSorts)
  }, [debouncedSearchState, mainFilterField])

  const currentFieldConfig = useMemo(
    () => config.find((field) => field.key === selectedFieldKey),
    [config, selectedFieldKey],
  )
  const availableOperators = useMemo(
    () => getAvailableOperators(currentFieldConfig),
    [currentFieldConfig],
  )
  const mainFilterLabel = useMemo(
    () => config.find((field) => field.key === mainFilterField)?.label ?? 'termo',
    [config, mainFilterField],
  )

  const handleFieldChange = (fieldKey: string) => {
    const nextField = config.find((field) => field.key === fieldKey)
    setSelectedFieldKey(fieldKey)
    setSelectedOperator(nextField ? getDefaultOperator(nextField) : 'LIKE')
    setFilterValue('')
  }

  const handleFilterValueChange = (value: string) => {
    const selectedOption = currentFieldConfig?.options?.find(
      (option) => JSON.stringify(option.value) === value,
    )
    setFilterValue(selectedOption?.value ?? value)
  }

  const handleAddFilter = () => {
    if (!selectedFieldKey || isEmptyValue(filterValue)) {
      return
    }

    setActiveFilters((previous) => [
      ...previous,
      {
        field: selectedFieldKey,
        value: filterValue,
        comparisonMethod: selectedOperator,
      },
    ])
    setFilterValue('')
  }

  const handleRemoveFilter = (index: number) => {
    setActiveFilters((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index),
    )
  }

  const handleToggleSort = (fieldKey: string) => {
    setActiveSorts((previous) => {
      const existing = previous.find((sort) => sort.field === fieldKey)
      return existing
        ? previous.filter((sort) => sort.field !== fieldKey)
        : [...previous, { field: fieldKey, direction: 'ASC' }]
    })
  }

  const handleChangeSortDirection = (fieldKey: string) => {
    setActiveSorts((previous) =>
      previous.map((sort) =>
        sort.field === fieldKey
          ? {
              ...sort,
              direction: sort.direction === 'ASC' ? 'DESC' : 'ASC',
            }
          : sort,
      ),
    )
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label={`Pesquisa rápida por ${mainFilterLabel}`}
            className={cn('w-full pl-9', mainSearchValue && 'pr-10')}
            onChange={(event) => setMainSearchValue(event.target.value)}
            placeholder={`Pesquisa rápida por ${mainFilterLabel}...`}
            type="search"
            value={mainSearchValue}
          />
          {mainSearchValue && (
            <SearchClearButton onClear={() => setMainSearchValue('')} />
          )}
        </div>

        {(filterableFields.length > 0 || sortableFields.length > 0) && (
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            {filterableFields.length > 0 && (
              <Button
                aria-controls={filterPanelId}
                aria-expanded={isFilterOpen}
                className={cn(
                  'w-full gap-2 sm:w-auto',
                  isFilterOpen && 'bg-secondary text-secondary-foreground',
                )}
                onClick={() => {
                  setIsFilterOpen((open) => !open)
                  setIsSortOpen(false)
                }}
                type="button"
                variant="outline"
              >
                <Filter aria-hidden="true" className="h-4 w-4" />
                <span>Filtrar</span>
                {activeFilters.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                    {activeFilters.length}
                  </span>
                )}
              </Button>
            )}

            {sortableFields.length > 0 && (
              <Button
                aria-controls={sortPanelId}
                aria-expanded={isSortOpen}
                className={cn(
                  'w-full gap-2 sm:w-auto',
                  isSortOpen && 'bg-secondary text-secondary-foreground',
                )}
                onClick={() => {
                  setIsSortOpen((open) => !open)
                  setIsFilterOpen(false)
                }}
                type="button"
                variant="outline"
              >
                <ArrowUpDown aria-hidden="true" className="h-4 w-4" />
                <span>Ordenar</span>
                {activeSorts.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                    {activeSorts.length}
                  </span>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {isFilterOpen && filterableFields.length > 0 && (
        <div id={filterPanelId}>
          <SearchFilterPanel
            activeFilters={activeFilters}
            availableOperators={availableOperators}
            config={config}
            filterValue={filterValue}
            onAddFilter={handleAddFilter}
            onFieldChange={handleFieldChange}
            onFilterValueChange={handleFilterValueChange}
            onOperatorChange={setSelectedOperator}
            onRemoveFilter={handleRemoveFilter}
            selectedFieldKey={selectedFieldKey}
            selectedOperator={selectedOperator}
          />
        </div>
      )}

      {isSortOpen && sortableFields.length > 0 && (
        <div id={sortPanelId}>
          <SearchSortPanel
            activeSorts={activeSorts}
            fields={sortableFields}
            onChangeDirection={handleChangeSortDirection}
            onToggleSort={handleToggleSort}
          />
        </div>
      )}
    </div>
  )
}
