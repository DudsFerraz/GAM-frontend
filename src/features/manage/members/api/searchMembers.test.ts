import { beforeEach, describe, expect, it, vi } from 'vitest'

import { searchMembers } from './searchMembers'

const apiMocks = vi.hoisted(() => ({ post: vi.fn() }))

vi.mock('@/lib/http', () => ({ api: apiMocks }))

beforeEach(() => {
  apiMocks.post.mockReset()
  apiMocks.post.mockResolvedValue({ data: {} })
})

describe('searchMembers', () => {
  it('inclui somente ativos por padrão e sanitiza a ordenação', async () => {
    apiMocks.post.mockResolvedValueOnce({
      data: {
        items: [
          {
            account: { displayName: 'Maria GAM', email: 'maria@example.test' },
            firstName: 'Maria',
            id: '550e8400-e29b-41d4-a716-446655440000',
            status: 'ACTIVE',
          },
          { firstName: 'Sem identificador' },
        ],
        page: 2,
        size: 20,
        totalElements: 21,
        totalPages: 2,
      },
    })

    const result = await searchMembers(
      [{ field: 'name', value: 'Maria', comparationMethod: 'LIKE' }],
      {
        page: 2,
        size: 20,
        sort: ['firstName,asc', 'email,asc', 'status,sideways'],
      },
    )

    expect(apiMocks.post).toHaveBeenCalledWith(
      '/members/search',
      {
        filters: [
          { field: 'name', value: 'Maria', comparationMethod: 'LIKE' },
          { field: 'status', value: ['ACTIVE'], comparationMethod: 'IN' },
        ],
      },
      {
        params: { page: 2, size: 20, sort: ['firstName,asc'] },
        paramsSerializer: { indexes: null },
      },
    )
    expect(result.items).toEqual([
      {
        birthDate: null,
        displayName: 'Maria GAM',
        email: 'maria@example.test',
        firstName: 'Maria',
        id: '550e8400-e29b-41d4-a716-446655440000',
        phoneNumber: null,
        status: 'ACTIVE',
        surname: null,
      },
    ])
    expect(result.last).toBe(true)
  })

  it('inclui ativos e inativos quando solicitado', async () => {
    await searchMembers([], { page: 0, size: 10 }, true)

    expect(apiMocks.post).toHaveBeenCalledWith(
      '/members/search',
      {
        filters: [{
          field: 'status',
          value: ['ACTIVE', 'INACTIVE'],
          comparationMethod: 'IN',
        }],
      },
      expect.any(Object),
    )
  })

  it('preserva um filtro explícito válido e substitui um inválido pelo padrão seguro', async () => {
    await searchMembers(
      [{ field: 'status', value: 'INACTIVE', comparationMethod: 'EQUALS' }],
    )
    expect(apiMocks.post.mock.calls[0]?.[1]).toEqual({
      filters: [{ field: 'status', value: 'INACTIVE', comparationMethod: 'EQUALS' }],
    })

    await searchMembers(
      [{ field: 'status', value: 'ARCHIVED', comparationMethod: 'EQUALS' }],
    )
    expect(apiMocks.post.mock.calls[1]?.[1]).toEqual({
      filters: [{ field: 'status', value: ['ACTIVE'], comparationMethod: 'IN' }],
    })
  })

  it('preenche metadados ausentes da página sem quebrar a view', async () => {
    apiMocks.post.mockResolvedValueOnce({ data: {} })

    await expect(searchMembers([], { page: 3, size: 25 })).resolves.toEqual({
      first: false,
      items: [],
      last: true,
      page: 3,
      size: 25,
      totalElements: 0,
      totalPages: 0,
    })
  })
})
