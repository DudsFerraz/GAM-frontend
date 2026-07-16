import type { components } from '@/api/generated/gam-api'
import { api } from '@/lib/http'

type PresencePage = components['schemas']['PagedResponsePresenceRDTO']

export async function getMemberPresences(
  memberId: string,
  page: number,
): Promise<PresencePage> {
  const { data } = await api.get<PresencePage>(`/members/${memberId}/presences`, {
    params: { page, size: 10, sort: ['createdAt,desc'] },
    paramsSerializer: { indexes: null },
  })
  return data
}
