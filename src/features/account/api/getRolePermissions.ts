import { api } from '@/lib/http'
import type { UUID } from '@/types/uuid'

import type { RolePermissionsResponse } from '../types'

export const getRolePermissions = async (
  roleId: UUID,
): Promise<RolePermissionsResponse> => {
  const { data } = await api.get<RolePermissionsResponse>(
    `/role/${roleId}/permissions`,
  )
  return data
}
