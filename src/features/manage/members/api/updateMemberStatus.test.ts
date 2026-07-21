import { beforeEach, describe, expect, it, vi } from 'vitest'

import { updateMemberStatus } from './updateMemberStatus'

const apiMocks = vi.hoisted(() => ({ patch: vi.fn() }))

vi.mock('@/lib/http', () => ({ api: apiMocks }))

beforeEach(() => {
  apiMocks.patch.mockReset()
})

describe('updateMemberStatus', () => {
  it.each([
    ['ACTIVE', 'activate'],
    ['INACTIVE', 'deactivate'],
  ] as const)(
    'envia a mudança para %s por meio de /members/{id}/%s',
    async (status, action) => {
      await updateMemberStatus('member-id', status, { reason: 'Necessidade do grupo' })

      expect(apiMocks.patch).toHaveBeenCalledWith(
        `/members/member-id/${action}`,
        { reason: 'Necessidade do grupo' },
      )
    },
  )
})
