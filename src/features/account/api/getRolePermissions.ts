import { api } from '@/lib/http'
import type { UUID } from '@/types/uuid'
import type { components } from '@/api/generated/gam-api'

import type { RolePermissionsResponse } from '../types'

export const getRolePermissions = async (
  roleId: UUID,
): Promise<RolePermissionsResponse> => {
  const { data } = await api.get<components['schemas']['GetRolePermissionsRDTO']>(
    `/roles/${roleId}/permissions`,
  )

  return {
    permissions: (data.permissions ?? []).flatMap((permission) => {
      if (!permission.id || !permission.code) return []

      return [{
        id: permission.id,
        code: permission.code,
        label: permission.label ?? permission.code,
        description: permission.description ?? '',
      }]
    }),
  }
}
