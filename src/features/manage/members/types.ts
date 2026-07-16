import type { components } from '@/api/generated/gam-api'

export type PageParams = {
  page?: number
  size?: number
  sort?: string[]
}

export type SearchFilter = NonNullable<
  components['schemas']['SearchDTO']['filters']
>[number]

export type ComparationMethod = SearchFilter['comparationMethod']

export type SpecificationFilter = SearchFilter & {
  value: string
}

export type MemberListItem = {
  id: string
  firstName: string
  surname: string | null
  displayName: string
  email: string | null
  birthDate: string | null
  phoneNumber: string | null
  status: 'ACTIVE' | 'INACTIVE' | null
}

export type MemberPage = {
  items: MemberListItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}
