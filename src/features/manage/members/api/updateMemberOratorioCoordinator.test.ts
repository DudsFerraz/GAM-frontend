import { beforeEach, describe, expect, it, vi } from 'vitest'

import { updateMemberOratorioCoordinator } from './updateMemberOratorioCoordinator'

const apiMocks = vi.hoisted(() => ({ patch: vi.fn() }))

vi.mock('@/lib/http', () => ({ api: apiMocks }))

beforeEach(() => {
  apiMocks.patch.mockReset()
})

describe('updateMemberOratorioCoordinator', () => {
  it.each(['grant', 'revoke'] as const)(
    'envia a transição da coordenação do Oratório para a rota de %s',
    async (action) => {
      await updateMemberOratorioCoordinator('member-id', action, {
        reason: 'Necessidade do Oratório',
      })

      expect(apiMocks.patch).toHaveBeenCalledWith(
        `/members/member-id/oratorio-coordinator/${action}`,
        { reason: 'Necessidade do Oratório' },
      )
    },
  )
})
