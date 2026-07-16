import type { FieldConfig } from './components/SearchAndFilter/types';

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
  },
  {
    key: 'phoneNumber',
    label: 'Telefone',
    inputType: 'text',
    allowedOperators: ['LIKE', 'EQUALS'],
    sortable: false,
  },
  {
    key: 'birthDate',
    label: 'Data de Nascimento', 
    inputType: 'date',
    allowedOperators: ['EQUALS', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN_OR_EQUAL'],
  },
  {
    key: 'status',
    label: 'Status', 
    inputType: 'select',
    options: [
      { label: 'Ativo', value: 'ACTIVE' },
      { label: 'Inativo', value: 'INACTIVE' },
    ],
    allowedOperators: ['EQUALS'],
  },
  {
    key: 'firstName',
    label: 'Primeiro nome',
    inputType: 'text',
    filterable: false,
  },
  {
    key: 'surname',
    label: 'Sobrenome',
    inputType: 'text',
    filterable: false,
  },
]
