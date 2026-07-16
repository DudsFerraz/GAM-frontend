import type { components } from '@/api/generated/gam-api'
import { api } from '@/lib/http'

type MemberStatusChange = components['schemas']['DeactivateMemberDTO']

export async function updateMemberStatus(
  memberId: string,
  status: 'ACTIVE' | 'INACTIVE',
  change: MemberStatusChange,
): Promise<void> {
  const action = status === 'ACTIVE' ? 'activate' : 'deactivate'

  await api.patch(`/members/${memberId}/${action}`, change)
}
