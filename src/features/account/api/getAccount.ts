import { api } from '@/lib/http'
import type { UUID } from '@/types/uuid'

import type { AccountResponse } from '../types'

export async function getAccount(id: UUID): Promise<AccountResponse> {
  const { data } = await api.get<AccountResponse>(`/account/${id}`)
  return data
}

