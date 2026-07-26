import type { components } from '@/api/generated/gam-api'
import { api } from '@/lib/http'

type MemberPageTransport = components['schemas']['PagedResponseMemberRDTO']

export type MemberByAccountEmail = {
  id: string
  status: 'ACTIVE' | 'INACTIVE'
}

export async function findMemberByAccountEmail(
  email: string,
): Promise<MemberByAccountEmail | null> {
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

  const member = data.items?.[0]

  if (!member?.id || !member.status) {
    return null
  }

  return {
    id: member.id,
    status: member.status,
  }
}
