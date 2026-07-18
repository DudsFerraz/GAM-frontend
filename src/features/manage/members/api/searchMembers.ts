import type { components } from '@/api/generated/gam-api'
import { api } from '@/lib/http'

import type {
  MemberListItem,
  MemberPage,
  PageParams,
  SearchFilter,
  SpecificationFilter,
} from '../types'

type MemberTransport = components['schemas']['MemberRDTO']
type MemberPageTransport = components['schemas']['PagedResponseMemberRDTO']

const MEMBER_STATUSES = ['ACTIVE', 'INACTIVE'] as const
const MEMBER_SORT_FIELDS = ['firstName', 'surname', 'birthDate', 'status'] as const

type MemberStatus = (typeof MEMBER_STATUSES)[number]

function isMemberStatus(value: unknown): value is MemberStatus {
  return MEMBER_STATUSES.some((status) => status === value)
}

function isSupportedMemberStatusFilter(filter: SearchFilter): boolean {
  if (filter.field !== 'status') {
    return true
  }

  if (filter.comparationMethod === 'EQUALS') {
    return isMemberStatus(filter.value)
  }

  if (filter.comparationMethod === 'IN') {
    return Array.isArray(filter.value)
      && filter.value.length > 0
      && filter.value.every(isMemberStatus)
  }

  return false
}

function toMemberSearchFilters(filters: SpecificationFilter[]): SearchFilter[] {
  const supportedFilters = filters.filter(isSupportedMemberStatusFilter)
  const hasStatusFilter = supportedFilters.some((filter) => filter.field === 'status')

  if (hasStatusFilter) {
    return supportedFilters
  }

  return [
    ...supportedFilters,
    {
      field: 'status',
      value: [...MEMBER_STATUSES],
      comparationMethod: 'IN',
    },
  ]
}

function isSupportedMemberSort(value: string): boolean {
  const parts = value.split(',')
  if (parts.length !== 2) {
    return false
  }

  const [field, direction] = parts
  return MEMBER_SORT_FIELDS.some((allowedField) => allowedField === field)
    && (direction === 'asc' || direction === 'desc')
}

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
  const requestedSort = (pageParams.sort ?? []).filter(isSupportedMemberSort)
  const params: { page?: number; size?: number; sort?: string[] } = {
    page: pageParams.page,
    size: pageParams.size,
  }
  if (requestedSort.length > 0) {
    params.sort = requestedSort
  }

  const searchFilters = toMemberSearchFilters(filters)

  const { data } = await api.post<MemberPageTransport>(
    '/members/search',
    { filters: searchFilters },
    {
      params,
      paramsSerializer: {
        indexes: null,
      },
    },
  )

  return toMemberPage(data, pageParams)
}
