import type { RolePermissionsResponse } from "@/types/api"
import type { UUID } from "@/utils/global"
import { api } from "@/lib/axios"

export const getRolePermissions = async (roleId: UUID): Promise<RolePermissionsResponse> => {
    const {data} = await api.get<RolePermissionsResponse>(`/role/${roleId}/permissions`);
    return data;
}

