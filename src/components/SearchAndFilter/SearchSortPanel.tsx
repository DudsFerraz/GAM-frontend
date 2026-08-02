import { ArrowDown, ArrowUp, Check } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

import type { FieldConfig, SortCriteria } from './types'

type SearchSortPanelProps = {
  activeSorts: SortCriteria[]
  fields: FieldConfig[]
  onChangeDirection: (fieldKey: string) => void
  onToggleSort: (fieldKey: string) => void
}

export function SearchSortPanel({
  activeSorts,
  fields,
  onChangeDirection,
  onToggleSort,
}: SearchSortPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <h4 className="mb-3 text-sm font-medium text-foreground">
        Ordenar resultados
      </h4>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => {
          const activeSort = activeSorts.find((sort) => sort.field === field.key)
          const isSelected = Boolean(activeSort)
          const sortIndex = activeSorts.findIndex((sort) => sort.field === field.key) + 1

          return (
            <div
              className={cn(
                'flex cursor-pointer items-center justify-between rounded-md border p-2 transition-all',
                isSelected
                  ? 'border-primary/50 bg-primary/5 shadow-sm'
                  : 'border-transparent hover:bg-secondary/50',
              )}
              key={field.key}
              onClick={() => onToggleSort(field.key)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onToggleSort(field.key)
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input',
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <span className={cn('text-sm', isSelected && 'font-medium')}>
                  {field.label}
                </span>
              </div>

              {isSelected && activeSort && (
                <div
                  className="flex items-center gap-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button
                    className="h-auto gap-1 px-1.5 py-0.5 text-[10px] uppercase"
                    onClick={() => onChangeDirection(field.key)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {activeSort.direction === 'ASC' ? (
                      <ArrowUp aria-hidden="true" className="h-3 w-3" />
                    ) : (
                      <ArrowDown aria-hidden="true" className="h-3 w-3" />
                    )}
                    {activeSort.direction === 'ASC' ? 'Cresc.' : 'Decresc.'}
                  </Button>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-secondary text-xs font-bold text-secondary-foreground">
                    {sortIndex}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
