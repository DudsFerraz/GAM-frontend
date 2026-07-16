import type { components } from '@/api/generated/gam-api'
import { api } from '@/lib/http'

import type {
  MemberListItem,
  MemberPage,
  PageParams,
  SpecificationFilter,
} from '../types'

type MemberTransport = components['schemas']['MemberRDTO']
type MemberPageTransport = components['schemas']['PagedResponseMemberRDTO']

function toMemberListItem(member: MemberTransport): MemberListItem | null {
  if (!member.id) {
    return null
  }

  return {
    id: member.id,
    firstName: member.firstName ?? 'Membro sem nome',
    surname: member.surname ?? null,
    displayName: member.account?.displayName ?? member.firstName ?? 'Membro',
    email: member.account?.email ?? null,
    birthDate: member.birthDate ?? null,
    phoneNumber: member.phoneNumber ?? null,
    status: member.status ?? null,
  }
}

function toMemberPage(
  response: MemberPageTransport,
  fallbackPage: PageParams,
): MemberPage {
  const page = response.page ?? fallbackPage.page ?? 0
  const totalPages = response.totalPages ?? 0

  return {
    items: (response.items ?? []).flatMap((member) => {
      const item = toMemberListItem(member)
      return item ? [item] : []
    }),
    page,
    size: response.size ?? fallbackPage.size ?? 10,
    totalElements: response.totalElements ?? 0,
    totalPages,
    first: response.first ?? page === 0,
    last: response.last ?? (totalPages === 0 || page >= totalPages - 1),
  }
}

export async function searchMembers(
  filters: SpecificationFilter[],
  pageParams: PageParams = { page: 0, size: 10 },
): Promise<MemberPage> {
  const { data } = await api.post<MemberPageTransport>(
    '/members/search',
    { filters },
    {
      params: {
        page: pageParams.page,
        size: pageParams.size,
        sort: pageParams.sort,
      },
      paramsSerializer: {
        indexes: null,
      },
    },
  )

  return toMemberPage(data, pageParams)
}
