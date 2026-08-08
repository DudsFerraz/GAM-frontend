import type { SearchFilter as SharedSearchFilter } from '@/components/SearchAndFilter'

export type PageParams = {
  page?: number
  size?: number
  sort?: string[]
}

export type SearchFilter = SharedSearchFilter
export type ComparisonMethod = SearchFilter['comparisonMethod']
export type SpecificationFilter = SearchFilter

export type MemberListItem = {
  id: string
  accountId: string | null
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
