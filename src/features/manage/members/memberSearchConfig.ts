import type { FieldConfig } from './components/SearchAndFilter/types';

export const MEMBERS_FILTER_CONFIG: FieldConfig[] = [
  {
    key: 'account.displayName',
    label: 'Nome de Exibição',
    inputType: 'text',
    allowedOperators: ['LIKE', 'EQUALS']
  },
  { 
    key: 'fullName', 
    label: 'Nome Completo', 
    inputType: 'text',
    allowedOperators: ['LIKE', 'EQUALS']
  },
  { 
    key: 'account.email', 
    label: 'E-mail', 
    inputType: 'text',
    allowedOperators: ['LIKE', 'EQUALS']
  },
  { 
    key: 'birthDate', 
    label: 'Data de Nascimento', 
    inputType: 'date',
    allowedOperators: ['EQUALS', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN_OR_EQUAL']
  },
  { 
    key: 'status', 
    label: 'Status', 
    inputType: 'select',
    options: [
      { label: 'Ativo', value: 'ACTIVE' },
      { label: 'Inativo', value: 'INACTIVE' },
      { label: 'Pendente', value: 'PENDENT' },
    ],
    allowedOperators: ['EQUALS']
  },
  { 
    key: 'account.accountRoles.role.name', 
    label: 'Cargo (Role)', 
    inputType: 'select',
    options: [
        { label: 'Coordenador', value: 'COORD' },
        { label: 'Membro', value: 'MEMBER' },
        { label: 'Visitante', value: 'VISITOR' },
    ],
    allowedOperators: ['EQUALS'],
    sortable: false
  },
  { 
    key: 'createdAt', 
    label: 'Data de Criação', 
    inputType: 'date', 
    filterable: false 
  },
  { 
    key: 'updatedAt', 
    label: 'Última Atualização', 
    inputType: 'date', 
    filterable: false 
  }
];
