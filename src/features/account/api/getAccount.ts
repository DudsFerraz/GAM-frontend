import { api } from '@/lib/http'
import type { UUID } from '@/types/uuid'

import type { AccountResponse } from '../types'
import { normalizeAccountRoles } from '../normalizeAccount'

export async function getAccount(id: UUID): Promise<AccountResponse> {
  const { data } = await api.get<unknown>(`/accounts/${id}`)

  if (
    typeof data !== 'object' ||
    data === null ||
    !('id' in data) ||
    typeof data.id !== 'string' ||
    !('email' in data) ||
    typeof data.email !== 'string' ||
    !('displayName' in data) ||
    typeof data.displayName !== 'string'
  ) {
    throw new Error('The Account response has an invalid shape.')
  }

  return {
    id: data.id,
    email: data.email,
    displayName: data.displayName,
    roles: normalizeAccountRoles('roles' in data ? data.roles : undefined),
    picture: 'picture' in data && typeof data.picture === 'string' ? data.picture : undefined,
  }
}
