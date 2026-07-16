import type { components } from '@/api/generated/gam-api'
import { api } from '@/lib/http'

type Member = components['schemas']['MemberRDTO']

export async function getMember(memberId: string): Promise<Member> {
  const { data } = await api.get<Member>(`/members/${memberId}`)
  return data
}
