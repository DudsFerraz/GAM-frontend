import {
  validateEmailSearchValue,
  type FieldConfig,
  type FilterValueValidator,
} from '@/components/SearchAndFilter'
import { MEMBER_STATUS_LABELS } from './presentation'

const PHONE_FORMAT_PATTERN = /^[+\d\s().-]+$/
const PHONE_E164_PATTERN = /^\+[1-9]\d{7,14}$/

const validateMemberPhoneSearchValue: FilterValueValidator = (
  value,
  comparisonMethod,
) => {
  if (typeof value !== 'string') {
    return comparisonMethod === 'EQUALS'
      ? 'Informe o telefone completo no formato internacional, como +5519999999999.'
      : 'Use somente números e sinais comuns de telefone, como +, espaços, parênteses ou hífen.'
  }

  const normalizedValue = value.trim()

  if (comparisonMethod === 'LIKE') {
    if (normalizedValue && !PHONE_FORMAT_PATTERN.test(normalizedValue)) {
      return 'Use somente números e sinais comuns de telefone, como +, espaços, parênteses ou hífen.'
    }

    const digitCount = normalizedValue.replace(/\D/g, '').length
    return digitCount >= 4
      ? undefined
      : 'Digite pelo menos 4 dígitos para pesquisar por telefone.'
  }

  if (comparisonMethod === 'EQUALS') {
    return PHONE_E164_PATTERN.test(normalizedValue)
      ? undefined
      : 'Informe o telefone completo no formato internacional, como +5519999999999.'
  }

  return undefined
}

export const MEMBERS_FILTER_CONFIG: FieldConfig[] = [
  {
    key: 'name',
    label: 'Nome',
    inputType: 'text',
    allowedOperators: ['LIKE'],
    sortable: false,
  },
  {
    key: 'email',
    label: 'E-mail',
    inputType: 'text',
    allowedOperators: ['LIKE', 'EQUALS'],
    sortable: false,
    validateValue: validateEmailSearchValue,
  },
  {
    key: 'phoneNumber',
    label: 'Telefone',
    inputType: 'text',
    allowedOperators: ['LIKE', 'EQUALS'],
    sortable: false,
    validateValue: validateMemberPhoneSearchValue,
  },
  {
    key: 'birthDate',
    label: 'Data de Nascimento',
    inputType: 'date',
    allowedOperators: ['EQUALS', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN_OR_EQUAL'],
    sortable: true,
  },
  {
    key: 'status',
    label: 'Situação',
    inputType: 'select',
    options: [
      { label: MEMBER_STATUS_LABELS.ACTIVE, value: ['ACTIVE'] },
      { label: MEMBER_STATUS_LABELS.INACTIVE, value: ['INACTIVE'] },
      {
        label: 'Ativos e inativos',
        value: ['ACTIVE', 'INACTIVE'],
      },
    ],
    allowedOperators: ['IN'],
    sortable: true,
  },
  {
    key: 'firstName',
    label: 'Primeiro nome',
    inputType: 'text',
    filterable: false,
    sortable: true,
  },
  {
    key: 'surname',
    label: 'Sobrenome',
    inputType: 'text',
    filterable: false,
    sortable: true,
  },
]
