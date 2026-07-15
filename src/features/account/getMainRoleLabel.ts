import type { RoleResponse } from './types';

const ROLE_HIERARCHY = ['COORD', 'MEMBER', 'VISITOR'];

const ROLE_LABELS: Record<string, string> = {
  COORD: 'Coordenador',
  MEMBER: 'Membro',
  VISITOR: 'Visitante',
};

export const getMainRoleLabel = (roles: RoleResponse[]): string => {
  if (!roles || roles.length === 0) return '-';

  const mainRoleKey = ROLE_HIERARCHY.find(priorityRole => 
    roles.some(userRole => userRole.name === priorityRole)
  );

  return mainRoleKey ? ROLE_LABELS[mainRoleKey] : (roles[0].name || '-');
};
