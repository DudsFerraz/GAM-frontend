import type { components } from '@/api/generated/gam-api'
import { normalizeAccountRoles } from '@/features/account'
import { api } from '@/lib/http'

type AccountTransport = components['schemas']['AccountRDTO']
type AccountPageTransport = components['schemas']['PagedResponseAccountRDTO']
export type Account = Omit<AccountTransport, 'roles'> & { roles: Role[] }
export type AccountPage = Omit<AccountPageTransport, 'items'> & { items?: Account[] }
export type AccountRoles = components['schemas']['AccountRolesRDTO']
export type AccountRoleAssignment = components['schemas']['AccountRoleRDTO']
export type Role = components['schemas']['RoleRDTO']
export type Permission = components['schemas']['PermissionRDTO']

export async function searchAccounts(term: string, field: 'displayName' | 'email', page: number): Promise<AccountPage> {
  const filters = term.trim()
    ? [{ field, value: term.trim(), comparationMethod: 'LIKE' as const }]
    : []
  const { data } = await api.post<AccountPageTransport>('/accounts/search', { filters }, {
    params: { page, size: 10, sort: ['displayName,asc'] },
    paramsSerializer: { indexes: null },
  })
  return {
    ...data,
    items: (data.items ?? []).map((account) => ({
      ...account,
      roles: normalizeAccountRoles(account.roles),
    })),
  }
}

export async function getAccountRoles(accountId: string): Promise<AccountRoles> {
  const { data } = await api.get<AccountRoles>(`/accounts/${accountId}/roles`)
  return data
}

export async function assignAccountRole(accountId: string, roleId: string, reason: string): Promise<AccountRoleAssignment> {
  const { data } = await api.post<AccountRoleAssignment>(`/accounts/${accountId}/roles`, { roleId, reason })
  return data
}

export async function dropAccountRole(accountId: string, roleId: string, reason: string): Promise<void> {
  await api.patch(`/accounts/${accountId}/roles/${roleId}/drop`, { reason })
}

export async function getAccountRoleAssignment(accountId: string, assignmentId: string): Promise<AccountRoleAssignment> {
  const { data } = await api.get<AccountRoleAssignment>(`/accounts/${accountId}/role-assignments/${assignmentId}`)
  return data
}

export async function getRole(roleId: string): Promise<Role> {
  const { data } = await api.get<Role>(`/roles/${roleId}`)
  return data
}

export async function getRolePermissions(roleId: string): Promise<Permission[]> {
  const { data } = await api.get<components['schemas']['GetRolePermissionsRDTO']>(`/roles/${roleId}/permissions`)
  return data.permissions ?? []
}

export async function getPermission(permissionId: string): Promise<Permission> {
  const { data } = await api.get<Permission>(`/permissions/${permissionId}`)
  return data
}
