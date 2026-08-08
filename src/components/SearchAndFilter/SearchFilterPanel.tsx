import { Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

import {
  getDisplayValue,
  getFieldLabel,
  getOptionKey,
  isEmptyValue,
  OPERATOR_LABELS,
} from './searchHelpers'
import type {
  ComparisonMethod,
  FieldConfig,
  SearchFilter,
  SearchFilterValue,
} from './types'

type SearchFilterPanelProps = {
  activeFilters: SearchFilter[]
  availableOperators: Array<{ key: ComparisonMethod; label: string }>
  config: FieldConfig[]
  filterValue: SearchFilterValue
  selectedFieldKey: string
  selectedOperator: ComparisonMethod
  onAddFilter: () => void
  onFieldChange: (fieldKey: string) => void
  onFilterValueChange: (value: string) => void
  onOperatorChange: (operator: ComparisonMethod) => void
  onRemoveFilter: (index: number) => void
  validationMessage?: string
  validationMessageId: string
}

export function SearchFilterPanel({
  activeFilters,
  availableOperators,
  config,
  filterValue,
  selectedFieldKey,
  selectedOperator,
  onAddFilter,
  onFieldChange,
  onFilterValueChange,
  onOperatorChange,
  onRemoveFilter,
  validationMessage,
  validationMessageId,
}: SearchFilterPanelProps) {
  const filterableFields = config.filter((field) => field.filterable !== false)
  const currentFieldConfig = config.find((field) => field.key === selectedFieldKey)

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <h4 className="mb-3 text-sm font-medium text-foreground">Novo filtro</h4>
      <div className="mb-4 flex flex-col items-start gap-2 sm:flex-row">
        <div className="w-full sm:w-1/3">
          <label className="mb-1 block text-xs text-muted-foreground">
            Campo
          </label>
          <Select
            aria-label="Campo do filtro"
            onChange={(event) => onFieldChange(event.target.value)}
            value={selectedFieldKey}
          >
            {filterableFields.map((field) => (
              <option key={field.key} value={field.key}>
                {field.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-full sm:w-1/4">
          <label className="mb-1 block text-xs text-muted-foreground">
            Condição
          </label>
          <Select
            aria-label="Condição do filtro"
            onChange={(event) => onOperatorChange(event.target.value as ComparisonMethod)}
            value={selectedOperator}
          >
            {availableOperators.map((operator) => (
              <option key={operator.key} value={operator.key}>
                {operator.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-full flex-1">
          <label className="mb-1 block text-xs text-muted-foreground">
            Valor
          </label>
          <FilterValueInput
            field={currentFieldConfig}
            value={filterValue}
            onChange={onFilterValueChange}
            onSubmit={onAddFilter}
            validationMessage={validationMessage}
            validationMessageId={validationMessageId}
          />
          {validationMessage && (
            <p
              className="mt-1 text-xs text-destructive"
              id={validationMessageId}
              role="alert"
            >
              {validationMessage}
            </p>
          )}
        </div>

        <Button
          aria-label="Adicionar filtro"
          className="shrink-0 self-end sm:mt-5 sm:self-auto"
          onClick={onAddFilter}
          size="icon"
          type="button"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        {activeFilters.length === 0 && (
          <p className="text-sm italic text-muted-foreground">
            Nenhum filtro aplicado.
          </p>
        )}
        {activeFilters.map((filter, index) => (
          <div
            className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-1 text-sm"
            key={`${filter.field}-${index}`}
          >
            <span className="font-medium text-foreground">
              {getFieldLabel(config, filter.field)}
            </span>
            <span className="text-xs lowercase text-muted-foreground">
              {OPERATOR_LABELS[filter.comparisonMethod]}
            </span>
            <span className="font-bold">{getDisplayValue(config, filter)}</span>
            <Button
              aria-label={`Remover filtro de ${getFieldLabel(config, filter.field)}`}
              className="ml-1 h-auto p-0 text-muted-foreground hover:text-destructive"
              onClick={() => onRemoveFilter(index)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function FilterValueInput({
  field,
  onChange,
  onSubmit,
  validationMessage,
  validationMessageId,
  value,
}: {
  field?: FieldConfig
  onChange: (value: string) => void
  onSubmit: () => void
  validationMessage?: string
  validationMessageId: string
  value: SearchFilterValue
}) {
  if (!field) {
    return null
  }

  if (field.inputType === 'select') {
    return (
      <Select
        aria-describedby={validationMessage ? validationMessageId : undefined}
        aria-invalid={validationMessage ? true : undefined}
        aria-label="Valor do filtro"
        onChange={(event) => onChange(event.target.value)}
        value={isEmptyValue(value) ? '' : getOptionKey(value)}
      >
        <option value="" disabled>
          Selecione...
        </option>
        {field.options?.map((option) => (
          <option key={getOptionKey(option.value)} value={getOptionKey(option.value)}>
            {option.label}
          </option>
        ))}
      </Select>
    )
  }

  return (
    <Input
      aria-describedby={validationMessage ? validationMessageId : undefined}
      aria-invalid={validationMessage ? true : undefined}
      aria-label="Valor do filtro"
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          onSubmit()
        }
      }}
      placeholder="Digite o valor..."
      type={field.inputType}
      value={typeof value === 'string' ? value : ''}
    />
  )
}
