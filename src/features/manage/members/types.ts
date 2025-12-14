import type { UUID } from "@/utils/global";

export type MemberResponse = {
    id: UUID,
    account: AccountResponse,
    name: string,
    birthDate: string,
    age: number,
    phoneNumber: string,
    status: string
}

export type AccountResponse = {
    id: UUID,
    email: string,
    displayName: string,
    roles: AccountRolesResponse,
}

export type AccountRolesResponse = {
    roles: Array<RoleResponse>
}

export type RoleResponse = {
    id: UUID,
    name: string,
    description: string
}