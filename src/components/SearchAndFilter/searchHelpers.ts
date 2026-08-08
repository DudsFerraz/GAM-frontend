import type {
  ComparisonMethod,
  FieldConfig,
  SearchFilter,
  SearchFilterValue,
} from './types'

export const OPERATOR_LABELS: Record<ComparisonMethod, string> = {
  EQUALS: 'Igual a',
  LIKE: 'Contém',
  GREATER_THAN_OR_EQUAL: 'Maior ou igual a',
  LESS_THAN_OR_EQUAL: 'Menor ou igual a',
  IN: 'Inclui',
}

const EMPTY_OPTION_LABEL = 'Valor não disponível'

export function isEmptyValue(value: SearchFilterValue) {
  return Array.isArray(value) ? value.length === 0 : value.trim().length === 0
}

export function getOptionKey(value: SearchFilterValue) {
  return JSON.stringify(value)
}

export function getDefaultOperator(field: FieldConfig): ComparisonMethod {
  if (field.allowedOperators?.[0]) {
    return field.allowedOperators[0]
  }

  return field.inputType === 'text' ? 'LIKE' : 'EQUALS'
}

export function getAvailableOperators(field?: FieldConfig) {
  if (!field) {
    return []
  }

  if (field.allowedOperators?.length) {
    return field.allowedOperators.map((operator) => ({
      key: operator,
      label: OPERATOR_LABELS[operator],
    }))
  }

  if (field.inputType === 'date') {
    return [
      { key: 'EQUALS' as const, label: OPERATOR_LABELS.EQUALS },
      {
        key: 'GREATER_THAN_OR_EQUAL' as const,
        label: OPERATOR_LABELS.GREATER_THAN_OR_EQUAL,
      },
      {
        key: 'LESS_THAN_OR_EQUAL' as const,
        label: OPERATOR_LABELS.LESS_THAN_OR_EQUAL,
      },
    ]
  }

  if (field.inputType === 'select') {
    return [{ key: 'EQUALS' as const, label: OPERATOR_LABELS.EQUALS }]
  }

  return Object.entries(OPERATOR_LABELS).map(([key, label]) => ({
    key: key as ComparisonMethod,
    label,
  }))
}

function formatDateValue(value: string) {
  const [year, month, day] = value.split('-')
  return year && month && day ? `${day}/${month}/${year}` : 'Data inválida'
}

export function getFieldLabel(config: FieldConfig[], fieldKey: string) {
  return config.find((field) => field.key === fieldKey)?.label
    ?? 'Campo não disponível'
}

export function getDisplayValue(
  config: FieldConfig[],
  filter: SearchFilter,
) {
  const field = config.find((item) => item.key === filter.field)

  if (field?.inputType === 'select' && field.options) {
    const selectedOption = field.options.find(
      (option) => getOptionKey(option.value) === getOptionKey(filter.value),
    )

    if (selectedOption) {
      return selectedOption.label
    }

    const values = Array.isArray(filter.value)
      ? filter.value
      : [filter.value]
    return values
      .map((value) => {
        const option = field.options?.find(
          (item) => getOptionKey(item.value) === getOptionKey(value),
        )
        return option?.label ?? EMPTY_OPTION_LABEL
      })
      .join(', ')
  }

  if (field?.inputType === 'date' && typeof filter.value === 'string') {
    return formatDateValue(filter.value)
  }

  return Array.isArray(filter.value) ? filter.value.join(', ') : filter.value
}
