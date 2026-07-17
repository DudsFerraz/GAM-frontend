import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  assignAccountRole,
  dropAccountRole,
  getAccountRoleAssignment,
  getAccountRoles,
  getPermission,
  getRole,
  getRolePermissions,
  searchAccounts,
} from '../api/accounts'
import { accountAdminQueryKeys } from '../queryKeys'

export function useSearchAccounts(term: string, field: 'displayName' | 'email', page: number, enabled = true) {
  return useQuery({ queryKey: accountAdminQueryKeys.search(term, field, page), queryFn: () => searchAccounts(term, field, page), placeholderData: keepPreviousData, enabled })
}

export function useAccountRoles(accountId: string | null) {
  return useQuery({ queryKey: accountAdminQueryKeys.roles(accountId ?? ''), queryFn: () => getAccountRoles(accountId ?? ''), enabled: Boolean(accountId) })
}

export function useAssignAccountRole(accountId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, reason }: { roleId: string; reason: string }) => assignAccountRole(accountId, roleId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountAdminQueryKeys.roles(accountId) }),
  })
}

export function useDropAccountRole(accountId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, reason }: { roleId: string; reason: string }) => dropAccountRole(accountId, roleId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountAdminQueryKeys.roles(accountId) }),
  })
}

export function useAccountRoleAssignment(accountId: string, assignmentId: string | null) {
  return useQuery({ queryKey: accountAdminQueryKeys.assignment(accountId, assignmentId ?? ''), queryFn: () => getAccountRoleAssignment(accountId, assignmentId ?? ''), enabled: Boolean(accountId && assignmentId), retry: false })
}

export function useRole(roleId: string | null) {
  return useQuery({ queryKey: accountAdminQueryKeys.role(roleId ?? ''), queryFn: () => getRole(roleId ?? ''), enabled: Boolean(roleId) })
}

export function useRolePermissions(roleId: string | null, enabled: boolean) {
  return useQuery({ queryKey: accountAdminQueryKeys.rolePermissions(roleId ?? ''), queryFn: () => getRolePermissions(roleId ?? ''), enabled: Boolean(roleId) && enabled })
}

export function usePermission(permissionId: string | null, enabled: boolean) {
  return useQuery({ queryKey: accountAdminQueryKeys.permission(permissionId ?? ''), queryFn: () => getPermission(permissionId ?? ''), enabled: Boolean(permissionId) && enabled })
}
