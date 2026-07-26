import type { components } from '@/api/generated/gam-api'
import { api } from '@/lib/http'

type OratorioCoordinatorTransition =
  components['schemas']['CoordinatorTransitionDTO']

export async function updateMemberOratorioCoordinator(
  memberId: string,
  action: 'grant' | 'revoke',
  transition: OratorioCoordinatorTransition,
): Promise<void> {
  await api.patch(
    `/members/${memberId}/oratorio-coordinator/${action}`,
    transition,
  )
}
