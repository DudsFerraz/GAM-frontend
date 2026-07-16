import type { components } from '@/api/generated/gam-api'
import { api } from '@/lib/http'

type RegisterMember = components['schemas']['RegisterMemberDTO']
type Member = components['schemas']['MemberRDTO']

export async function createMember(payload: RegisterMember): Promise<Member> {
  const { data } = await api.post<Member>('/members', payload)
  return data
}
