import { beforeEach, describe, expect, it, vi } from 'vitest'

import { updateMemberCoordinator } from './updateMemberCoordinator'

const apiMocks = vi.hoisted(() => ({ patch: vi.fn() }))

vi.mock('@/lib/http', () => ({ api: apiMocks }))

beforeEach(() => {
  apiMocks.patch.mockReset()
})

describe('updateMemberCoordinator', () => {
  it.each(['grant', 'revoke'] as const)(
    'envia a transição de coordenação para a rota de %s',
    async (action) => {
      await updateMemberCoordinator('member-id', action, { reason: 'Necessidade do grupo' })

      expect(apiMocks.patch).toHaveBeenCalledWith(
        `/members/member-id/coordinator/${action}`,
        { reason: 'Necessidade do grupo' },
      )
    },
  )
})
