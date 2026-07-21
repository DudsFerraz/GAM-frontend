import type { components } from '@/api/generated/gam-api'
import { api } from '@/lib/http'

type CoordinatorTransition = components['schemas']['CoordinatorTransitionDTO']

export async function updateMemberCoordinator(
  memberId: string,
  action: 'grant' | 'revoke',
  transition: CoordinatorTransition,
): Promise<void> {
  await api.patch(`/members/${memberId}/coordinator/${action}`, transition)
}
