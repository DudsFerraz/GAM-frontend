import type { UUID } from "@/utils/global";

export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type PageParams = {
    page?: number;
    size?: number;
    sort?: string[];
}

export type ComparationMethod = 
  | 'EQUALS' 
  | 'LIKE' 
  | 'GREATER_THAN_OR_EQUAL' 
  | 'LESS_THAN_OR_EQUAL' 
  | 'IN';

export type SpecificationFilter = {
    field: string;
    value: string;
    comparationMethod: ComparationMethod;
}

export type SearchDTO = {
  filters: Array<SpecificationFilter>;
}

export type Roles =
  | 'VISITOR'
  | 'MEMBER'
  | 'COORD'

export const ROLE_HIERARCHY = ['COORD', 'MEMBER', 'VISITOR'];

export const ROLE_LABELS: Record<string, string> = {
  COORD: 'Coordenador',
  MEMBER: 'Membro',
  VISITOR: 'Visitante'
};

export type MemberResponse = {
    id: UUID,
    account: AccountResponse,
    name: string,
    birthDate: string,
    age: number,
    phoneNumber: string,
    status: string,
    picture?: string;
}

export type AccountResponse = {
    id: UUID,
    email: string,
    displayName: string,
    roles: AccountRolesResponse,
    picture?: string 
}

export type AccountRolesResponse = {
    roles: Array<RoleResponse>
}

export type RoleResponse = {
    id: UUID,
    name: string,
    description: string
}

export type PermissionResponse = {
  id: UUID,
  name: string,
  description: string
}

export type RolePermissionsResponse = {
  permissions: Array<PermissionResponse>
}