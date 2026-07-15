import type { AccountResponse } from '@/features/account'
import type { UUID } from '@/types/uuid'

export type Page<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export type PageParams = {
  page?: number
  size?: number
  sort?: string[]
}

export type ComparationMethod =
  | 'EQUALS'
  | 'LIKE'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LESS_THAN_OR_EQUAL'
  | 'IN'

export type SpecificationFilter = {
  field: string
  value: string
  comparationMethod: ComparationMethod
}

export type SearchDTO = {
  filters: SpecificationFilter[]
}

export type MemberResponse = {
  id: UUID
  account: AccountResponse
  name: string
  birthDate: string
  age: number
  phoneNumber: string
  status: string
  picture?: string
}

