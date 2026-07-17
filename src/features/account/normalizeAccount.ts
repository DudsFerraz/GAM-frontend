import type { components } from '@/api/generated/gam-api'

import type { RoleResponse } from './types'

type RoleTransport = components['schemas']['RoleRDTO']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeRole(value: unknown): RoleResponse | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string') {
    return null
  }

  return {
    id: value.id,
    name: value.name,
    description: typeof value.description === 'string' ? value.description : '',
    systemManaged: typeof value.systemManaged === 'boolean' ? value.systemManaged : false,
  }
}

export function normalizeAccountRoles(value: unknown): RoleResponse[] {
  const roleValues = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.roles)
      ? value.roles
      : []

  return roleValues.flatMap((role: RoleTransport | unknown) => {
    const normalizedRole = normalizeRole(role)
    return normalizedRole ? [normalizedRole] : []
  })
}
