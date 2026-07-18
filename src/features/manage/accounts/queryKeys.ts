// Query keys for account administration
// These keys are used to identify and manage queries related to account administration in the application. 
// They help in caching, invalidating, and refetching data efficiently.
export const accountAdminQueryKeys = {
  all: ['account-administration'] as const,
  search: (term: string, field: string, page: number) => [...accountAdminQueryKeys.all, 'search', term, field, page] as const,
  roles: (accountId: string) => [...accountAdminQueryKeys.all, accountId, 'roles'] as const,
  assignment: (accountId: string, assignmentId: string) => [...accountAdminQueryKeys.all, accountId, 'assignments', assignmentId] as const,
  role: (roleId: string) => ['rbac', 'roles', roleId] as const,
  rolePermissions: (roleId: string) => ['rbac', 'roles', roleId, 'permissions'] as const,
  permission: (permissionId: string) => ['rbac', 'permissions', permissionId] as const,
}
