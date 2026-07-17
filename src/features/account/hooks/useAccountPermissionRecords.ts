import { useQueries } from '@tanstack/react-query'

import { getRolePermissions } from '../api/getRolePermissions'
import type { AccountResponse, PermissionResponse } from '../types'

// This hook fetches the permission records for the given account's roles.
export function useAccountPermissionRecords(account: AccountResponse | null, enabled = true) {
  const results = useQueries({
    queries: (enabled ? account?.roles ?? [] : []).map((role) => ({
      queryKey: ['role-permissions', role.id],
      queryFn: () => getRolePermissions(role.id),
      staleTime: 1000 * 60 * 60,
    })),
  })

  const records = new Map<string, PermissionResponse>()
  for (const result of results) {
    for (const permission of result.data?.permissions ?? []) {
      records.set(permission.id, permission)
    }
  }

  return {
    permissionRecords: Array.from(records.values()),
    isLoading: results.some((result) => result.isLoading),
  }
}
