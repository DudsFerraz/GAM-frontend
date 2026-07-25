import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMemberPresences } from './getMemberPresences'

const apiMocks = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('@/lib/http', () => ({ api: apiMocks }))

beforeEach(() => {
  apiMocks.get.mockReset()
})

describe('getMemberPresences', () => {
  it('ordena o histórico pelo instante de registro aceito pelo contrato', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { items: [] } })

    await getMemberPresences('member-id', 3)

    expect(apiMocks.get).toHaveBeenCalledWith('/members/member-id/presences', {
      params: { page: 3, size: 10, sort: ['registeredAt,desc'] },
      paramsSerializer: { indexes: null },
    })
  })
})
