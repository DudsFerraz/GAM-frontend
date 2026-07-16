import { useQueries } from '@tanstack/react-query';
import { getRolePermissions } from '../api/getRolePermissions';
import type { AccountResponse, PermissionResponse } from '../types';

export const useAccountPermissions = (user: AccountResponse | null) => {
  const roleIds = user?.roles.map((role) => role.id) ?? [];

  const results = useQueries({
    queries: roleIds.map((id) => ({
      queryKey: ['role-permissions', id],
      queryFn: () => getRolePermissions(id),
      enabled: !!id,
      staleTime: 1000 * 60 * 60,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);

  const allPermissions = new Set<string>();
  const permissionRecords = new Map<string, PermissionResponse>();
  
  results.forEach((result) => {
    if (result.data?.permissions) {
      result.data.permissions.forEach((p) => {
        allPermissions.add(p.code);
        permissionRecords.set(p.id, p);
      });
    }
  });

  return {
    permissions: Array.from(allPermissions),
    permissionRecords: Array.from(permissionRecords.values()),
    isLoading,
  };
};
