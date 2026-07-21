import type { components } from '@/api/generated/gam-api'
import { api } from '@/lib/http'

type MemberPageTransport = components['schemas']['PagedResponseMemberRDTO']

export async function findMemberByAccountEmail(email: string): Promise<string | null> {
  const { data } = await api.post<MemberPageTransport>(
    '/members/search',
    {
      filters: [
        { field: 'email', value: email, comparationMethod: 'EQUALS' },
        { field: 'status', value: ['ACTIVE', 'INACTIVE'], comparationMethod: 'IN' },
      ],
    },
    { params: { page: 0, size: 1 } },
  )

  return data.items?.[0]?.id ?? null
}
