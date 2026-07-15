import { useQueries } from '@tanstack/react-query';
import { getRolePermissions } from '../api/getRolePermissions';
import type { AccountResponse } from '../types';

export const useAccountPermissions = (user: AccountResponse | null) => {
  const roleIds = user?.roles?.roles?.map((r) => r.id) || [];

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
  
  results.forEach((result) => {
    if (result.data?.permissions) {
      result.data.permissions.forEach((p) => {
        allPermissions.add(p.name);
      });
    }
  });

  return {
    permissions: Array.from(allPermissions),
    isLoading,
  };
};
