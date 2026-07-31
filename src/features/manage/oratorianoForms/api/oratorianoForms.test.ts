import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getOratorianoFormHistory } from './oratorianoForms'

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
