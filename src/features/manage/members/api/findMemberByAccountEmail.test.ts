import { beforeEach, describe, expect, it, vi } from 'vitest'

import { findMemberByAccountEmail } from './findMemberByAccountEmail'

const apiMocks = vi.hoisted(() => ({ post: vi.fn() }))

vi.mock('@/lib/http', () => ({ api: apiMocks }))

beforeEach(() => {
  apiMocks.post.mockReset()
})

describe('findMemberByAccountEmail', () => {
  it('busca membros ativos e inativos pelo e-mail da conta', async () => {
    apiMocks.post.mockResolvedValueOnce({
      data: { items: [{ id: 'member-id', status: 'ACTIVE' }] },
    })

    await expect(findMemberByAccountEmail('maria@example.test')).resolves.toEqual({
      id: 'member-id',
      status: 'ACTIVE',
    })
    expect(apiMocks.post).toHaveBeenCalledWith(
      '/members/search',
      {
        filters: [
          { field: 'email', value: 'maria@example.test', comparationMethod: 'EQUALS' },
          { field: 'status', value: ['ACTIVE', 'INACTIVE'], comparationMethod: 'IN' },
        ],
      },
      { params: { page: 0, size: 1 } },
    )
  })

  it('não inventa um identificador quando nenhum membro é encontrado', async () => {
    apiMocks.post.mockResolvedValueOnce({ data: { items: [] } })

    await expect(findMemberByAccountEmail('maria@example.test')).resolves.toBeNull()
  })

  it('descarta um resultado incompleto na fronteira de transporte', async () => {
    apiMocks.post.mockResolvedValueOnce({
      data: { items: [{ id: 'member-id' }] },
    })

    await expect(findMemberByAccountEmail('maria@example.test')).resolves.toBeNull()
  })
})
