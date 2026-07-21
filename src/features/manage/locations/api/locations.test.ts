import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createLocation, getLocation, getLocations } from './locations'

const apiMocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))

vi.mock('@/lib/http', () => ({ api: apiMocks }))

beforeEach(() => {
  apiMocks.get.mockReset()
  apiMocks.post.mockReset()
})

describe('locations API', () => {
  it('lista locais pela rota canônica com paginação e ordenação', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { items: [] } })

    await getLocations(2, 24)

    expect(apiMocks.get).toHaveBeenCalledWith('/gam-locations', {
      params: { page: 2, size: 24, sort: ['name,asc'] },
      paramsSerializer: { indexes: null },
    })
  })

  it('consulta e cria locais pela rota canônica', async () => {
    const payload = { name: 'Salão paroquial', city: 'São Paulo', state: 'SP', countryCode: 'BR' }
    apiMocks.get.mockResolvedValueOnce({ data: { id: 'location-id' } })
    apiMocks.post.mockResolvedValueOnce({ data: { id: 'location-id' } })

    await getLocation('location-id')
    await createLocation(payload)

    expect(apiMocks.get).toHaveBeenLastCalledWith('/gam-locations/location-id')
    expect(apiMocks.post).toHaveBeenCalledWith('/gam-locations', payload)
  })
})
