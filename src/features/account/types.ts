import type { components } from '@/api/generated/gam-api'
import type { UUID } from '@/types/uuid'

type CurrentAccount = components['schemas']['CurrentAccountContextRDTO']

export type AccountResponse = CurrentAccount & {
  picture?: string
}

export type AccountRolesResponse = {
  roles: RoleResponse[]
}

export type RoleResponse = CurrentAccount['roles'][number]

export type PermissionResponse = {
  id: UUID
  code: string
  label: string
  description: string
}

export type RolePermissionsResponse = {
  permissions: PermissionResponse[]
}
