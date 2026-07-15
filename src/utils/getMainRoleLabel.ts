import { ROLE_HIERARCHY, ROLE_LABELS } from "@/types/api";
import type { RoleResponse } from "@/types/api";

export const getMainRoleLabel = (roles: RoleResponse[]): string => {
  if (!roles || roles.length === 0) return '-';

  const mainRoleKey = ROLE_HIERARCHY.find(priorityRole => 
    roles.some(userRole => userRole.name === priorityRole)
  );

  return mainRoleKey ? ROLE_LABELS[mainRoleKey] : (roles[0].name || '-');
};
