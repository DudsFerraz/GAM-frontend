import type { UUID } from '@/types/uuid'

export type AccountResponse = {
  id: UUID
  email: string
  displayName: string
  roles: RoleResponse[]
  picture?: string
}

export type AccountRolesResponse = {
  roles: RoleResponse[]
}

export type RoleResponse = {
  id: UUID
  name: string
  description: string
}

export type PermissionResponse = {
  id: UUID
  code: string
  label: string
  description: string
}

export type RolePermissionsResponse = {
  permissions: PermissionResponse[]
}
