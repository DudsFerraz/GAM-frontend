import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getAccountRoles, searchAccounts, searchRoles } from './accounts'

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock('@/lib/http', () => ({ api: apiMocks }))

const role = {
  description: 'Descrição de transporte',
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'MEMBER',
  systemManaged: true,
}

beforeEach(() => {
  apiMocks.get.mockReset()
  apiMocks.post.mockReset()
})

describe('searchAccounts', () => {
  it('normaliza tanto papéis planos quanto embrulhados na fronteira', async () => {
    apiMocks.post.mockResolvedValueOnce({
      data: {
        items: [
          { displayName: 'Conta plana', roles: [role] },
          { displayName: 'Conta embrulhada', roles: { roles: [role] } },
        ],
      },
    })

    const result = await searchAccounts('  Conta  ', 'displayName', 1)

    expect(apiMocks.post).toHaveBeenCalledWith(
      '/accounts/search',
      {
        filters: [{
          field: 'displayName',
          value: 'Conta',
          comparationMethod: 'LIKE',
        }],
      },
      {
        params: { page: 1, size: 10, sort: ['displayName,asc'] },
        paramsSerializer: { indexes: null },
      },
    )
    expect(result.items?.map((item) => item.roles)).toEqual([[role], [role]])
  })

  it('não envia filtro vazio', async () => {
    apiMocks.post.mockResolvedValueOnce({ data: {} })

    await searchAccounts('   ', 'email', 0)

    expect(apiMocks.post.mock.calls[0]?.[1]).toEqual({ filters: [] })
  })
})

describe('getAccountRoles', () => {
  it.each([[role], { roles: [role] }])(
    'normaliza a resposta de papéis (%s)',
    async (transport) => {
      apiMocks.get.mockResolvedValueOnce({ data: transport })

      await expect(getAccountRoles('account-id')).resolves.toEqual({ roles: [role] })
      expect(apiMocks.get).toHaveBeenLastCalledWith('/accounts/account-id/roles')
    },
  )
})

describe('searchRoles', () => {
  it('busca papéis pelo nome normalizado e retorna a lista', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { roles: [role] } })

    await expect(searchRoles('  membro  ')).resolves.toEqual([role])
    expect(apiMocks.get).toHaveBeenLastCalledWith('/roles', {
      params: { name: 'membro' },
    })
  })
})
