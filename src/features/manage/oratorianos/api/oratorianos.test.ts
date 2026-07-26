import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  deleteOratoriano,
  getOratorianoAttendanceSummary,
  getOratorianoAttendances,
  registerOratoriano,
  replaceOratoriano,
  searchOratorianos,
} from './oratorianos'

const apiMocks = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}))

vi.mock('@/lib/http', () => ({ api: apiMocks }))

beforeEach(() => {
  Object.values(apiMocks).forEach((mock) => mock.mockReset())
})

describe('API de Oratorianos', () => {
  it('busca por nome humano e usa paginação explícita', async () => {
    apiMocks.post.mockResolvedValueOnce({ data: { items: [] } })

    await searchOratorianos('  Ana Souza  ', 2)

    expect(apiMocks.post).toHaveBeenCalledWith(
      '/oratorianos/search',
      {
        filters: [{
          comparationMethod: 'LIKE',
          field: 'name',
          value: 'Ana Souza',
        }],
      },
      { params: { page: 2, size: 12 } },
    )
  })

  it('cadastra somente com nome e sobrenome', async () => {
    const payload = { firstName: 'Ana', surname: 'Souza' }
    apiMocks.post.mockResolvedValueOnce({ data: payload })

    await registerOratoriano(payload)

    expect(apiMocks.post).toHaveBeenCalledWith('/oratorianos', payload)
  })

  it('substitui o perfil comum integralmente', async () => {
    const payload = {
      birthDate: '2015-03-02',
      firstName: 'Ana',
      phoneNumber: '+5519999999999',
      reason: 'Correção do nome civil.',
      surname: 'Souza',
    }
    apiMocks.put.mockResolvedValueOnce({ data: payload })

    await replaceOratoriano('oratoriano-id', payload)

    expect(apiMocks.put).toHaveBeenCalledWith(
      '/oratorianos/oratoriano-id',
      payload,
    )
  })

  it('exclui o cadastro com o motivo no corpo da requisição', async () => {
    apiMocks.delete.mockResolvedValueOnce({ data: undefined })

    await deleteOratoriano('oratoriano-id', {
      reason: 'Cadastro criado para a pessoa errada.',
    })

    expect(apiMocks.delete).toHaveBeenCalledWith(
      '/oratorianos/oratoriano-id',
      {
        data: { reason: 'Cadastro criado para a pessoa errada.' },
      },
    )
  })

  it('consulta histórico e resumo sem criar classificação', async () => {
    apiMocks.get.mockResolvedValue({ data: { items: [] } })

    await getOratorianoAttendances('oratoriano-id', 1)
    await getOratorianoAttendanceSummary('oratoriano-id', 2026, 8)

    expect(apiMocks.get).toHaveBeenNthCalledWith(
      1,
      '/oratorianos/oratoriano-id/attendances',
      { params: { page: 1, size: 10 } },
    )
    expect(apiMocks.get).toHaveBeenNthCalledWith(
      2,
      '/oratorianos/oratoriano-id/attendance-summary',
      { params: { month: 8, year: 2026 } },
    )
  })
})
