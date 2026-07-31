import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getOratorianoFormDetail,
  getOratorianoFormHistory,
} from './oratorianoForms'

const apiMocks = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('@/lib/http', () => ({ api: apiMocks }))

beforeEach(() => {
  apiMocks.get.mockReset()
})

describe('API do histórico de fichas adicionais', () => {
  it('usa GET, path relativo e paginação explícita', async () => {
    const response = { items: [], page: 2, totalPages: 3 }
    apiMocks.get.mockResolvedValueOnce({ data: response })

    const result = await getOratorianoFormHistory(
      'oratoriano-id',
      2,
      25,
    )

    expect(apiMocks.get).toHaveBeenCalledWith(
      '/oratorianos/oratoriano-id/forms',
      { params: { page: 2, size: 25 } },
    )
    expect(result).toBe(response)
  })

  it('usa dez itens por página como padrão', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { items: [] } })

    await getOratorianoFormHistory('oratoriano-id', 0)

    expect(apiMocks.get).toHaveBeenCalledWith(
      '/oratorianos/oratoriano-id/forms',
      { params: { page: 0, size: 10 } },
    )
  })
})

describe('API do detalhe de ficha adicional', () => {
  it('usa GET, path relativo e os dois identificadores corretos', async () => {
    const response = {
      data: {},
      origin: 'DIRECT_SYSTEM_ENTRY',
      status: 'DRAFT',
      version: 3,
    }
    apiMocks.get.mockResolvedValueOnce({ data: response })

    const result = await getOratorianoFormDetail(
      'oratoriano-id',
      'form-id',
    )

    expect(apiMocks.get).toHaveBeenCalledWith(
      '/oratorianos/oratoriano-id/forms/form-id',
    )
    expect(result).toBe(response)
  })

  it('codifica os identificadores sem alterar o path do recurso', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { data: {} } })

    await getOratorianoFormDetail('oratoriano/id', 'form id')

    expect(apiMocks.get).toHaveBeenCalledWith(
      '/oratorianos/oratoriano%2Fid/forms/form%20id',
    )
  })

  it('preserva o erro para a fronteira segura da página', async () => {
    const error = new Error('diagnóstico sintético')
    apiMocks.get.mockRejectedValueOnce(error)

    await expect(getOratorianoFormDetail('oratoriano-id', 'form-id'))
      .rejects.toBe(error)
  })
})
