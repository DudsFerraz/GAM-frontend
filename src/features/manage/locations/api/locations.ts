import type { components } from '@/api/generated/gam-api'
import { api } from '@/lib/http'

export type Location = components['schemas']['GamLocationRDTO']
export type LocationPage = components['schemas']['PagedResponseGamLocationRDTO']
export type CreateLocation = components['schemas']['GamLocationMutationDTO']
export type CreatedLocation = components['schemas']['GamLocationRDTO']
export type UpdateLocation = components['schemas']['GamLocationMutationDTO']
export type RemoveLocation = components['schemas']['RemoveGamLocationDTO']

export async function getLocations(page: number, size = 12): Promise<LocationPage> {
  const { data } = await api.get<LocationPage>('/gam-locations', {
    params: { page, size, sort: ['name,asc'] },
    paramsSerializer: { indexes: null },
  })
  return data
}

export async function getLocation(locationId: string): Promise<Location> {
  const { data } = await api.get<Location>(`/gam-locations/${locationId}`)
  return data
}

export async function createLocation(payload: CreateLocation): Promise<CreatedLocation> {
  const { data } = await api.post<CreatedLocation>('/gam-locations', payload)
  return data
}

export async function updateLocation(locationId: string, payload: UpdateLocation): Promise<Location> {
  const { data } = await api.put<Location>(`/gam-locations/${locationId}`, payload)
  return data
}

export async function removeLocation(locationId: string, payload: RemoveLocation): Promise<void> {
  await api.delete(`/gam-locations/${locationId}`, { data: payload })
}
