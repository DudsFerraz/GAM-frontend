const ROLE_PRESENTATIONS: Readonly<
  Record<string, { label: string; description: string }>
> = {
  SUDO: {
    label: 'Administrador do sistema',
    description: 'Acesso administrativo completo à plataforma.',
  },
  COORD: {
    label: 'Coordenação',
    description: 'Acesso às atividades de coordenação e administração do grupo.',
  },
  MEMBER: {
    label: 'Membro',
    description: 'Acesso às atividades destinadas aos membros do grupo.',
  },
  VISITOR: {
    label: 'Visitante',
    description: 'Acesso às informações e atividades abertas ao público.',
  },
}

const PERMISSION_PRESENTATIONS: Readonly<
  Record<string, { label: string; description: string }>
> = {
  MEMBER_GET: {
    label: 'Consultar membros',
    description: 'Permite consultar os dados de membros ativos.',
  },
  MEMBER_SEARCH: {
    label: 'Buscar membros',
    description: 'Permite pesquisar membros do grupo.',
  },
  MEMBER_ACTIVATION: {
    label: 'Alterar situação de membros',
    description: 'Permite ativar e desativar membros.',
  },
  MEMBER_GET_NON_ACTIVE: {
    label: 'Consultar membros inativos',
    description: 'Permite consultar membros que não estão ativos.',
  },
  MEMBER_MANAGE: {
    label: 'Gerenciar membros',
    description: 'Permite administrar cadastros e solicitações de membresia.',
  },
  ACCOUNT_GET: {
    label: 'Consultar contas',
    description: 'Permite consultar contas da plataforma.',
  },
  ACCOUNT_SEARCH: {
    label: 'Buscar contas',
    description: 'Permite pesquisar contas da plataforma.',
  },
  ACCOUNT_ROLE_MANAGE: {
    label: 'Gerenciar tipos de acesso',
    description: 'Permite alterar os tipos de acesso associados a uma conta.',
  },
  EVENT_CREATE: {
    label: 'Criar eventos',
    description: 'Permite cadastrar novos eventos.',
  },
  EVENT_SEARCH: {
    label: 'Buscar eventos',
    description: 'Permite pesquisar eventos.',
  },
  EVENT_GET_PRESENCES: {
    label: 'Consultar presenças em eventos',
    description: 'Permite consultar a lista de presenças de um evento.',
  },
  EVENT_GET_MEMBER: {
    label: 'Acessar eventos para membros',
    description: 'Permite acessar eventos destinados aos membros.',
  },
  EVENT_GET_COORD: {
    label: 'Acessar eventos da coordenação',
    description: 'Permite acessar eventos destinados à coordenação.',
  },
  EVENT_MANAGE: {
    label: 'Gerenciar eventos',
    description: 'Permite administrar eventos.',
  },
  PRESENCES_SEARCH: {
    label: 'Buscar presenças',
    description: 'Permite pesquisar registros de presença.',
  },
  ROLE_GET: {
    label: 'Consultar tipos de acesso',
    description: 'Permite consultar os tipos de acesso disponíveis.',
  },
  PERMISSION_GET: {
    label: 'Consultar capacidades de acesso',
    description: 'Permite consultar capacidades associadas aos tipos de acesso.',
  },
}

type RolePresentationInput = {
  name?: string | null
  systemManaged?: boolean | null
}

export function getRolePresentation(role: RolePresentationInput): {
  label: string
  description: string
} {
  const presentation = role.name && Object.prototype.hasOwnProperty.call(ROLE_PRESENTATIONS, role.name)
    ? ROLE_PRESENTATIONS[role.name]
    : undefined

  if (presentation) {
    return presentation
  }

  return {
    label: role.systemManaged ? 'Tipo de acesso não identificado' : 'Tipo de acesso personalizado',
    description: 'Os detalhes deste tipo de acesso não estão disponíveis.',
  }
}

export function getRoleLabel(role: RolePresentationInput): string {
  return getRolePresentation(role).label
}

export function getPermissionPresentation(code?: string | null): {
  label: string
  description: string
} {
  return code && Object.prototype.hasOwnProperty.call(PERMISSION_PRESENTATIONS, code)
    ? PERMISSION_PRESENTATIONS[code]
    : {
        label: 'Capacidade de acesso não identificada',
        description: 'Os detalhes desta capacidade de acesso não estão disponíveis.',
      }
}

export function getPermissionLabel(code?: string | null): string {
  return getPermissionPresentation(code).label
}
