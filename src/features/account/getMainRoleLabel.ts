import type { RoleResponse } from './types';
import { getRoleLabel } from './presentation'

const ROLE_HIERARCHY = ['SUDO', 'COORD', 'MEMBER', 'VISITOR'];

export const getMainRoleLabel = (roles: RoleResponse[]): string => {
  if (!roles || roles.length === 0) return '-';

  const mainRoleName = ROLE_HIERARCHY.find((priorityRole) =>
    roles.some((role) => role.name === priorityRole),
  )
  const mainRole = roles.find((role) => role.name === mainRoleName)

  return getRoleLabel(mainRole ?? roles[0]);
};
