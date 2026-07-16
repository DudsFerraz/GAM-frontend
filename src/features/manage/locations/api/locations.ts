import type { components } from '@/api/generated/gam-api'
import { api } from '@/lib/http'

export type Location = components['schemas']['LocationRDTO']
export type LocationPage = components['schemas']['PagedResponseLocationRDTO']
export type CreateLocation = components['schemas']['CreateLocationDTO']
export type CreatedLocation = components['schemas']['CreateLocationRDTO']

export async function getLocations(page: number, size = 12): Promise<LocationPage> {
  const { data } = await api.get<LocationPage>('/locations', {
    params: { page, size, sort: ['name,asc'] },
    paramsSerializer: { indexes: null },
  })
  return data
}

export async function getLocation(locationId: string): Promise<Location> {
  const { data } = await api.get<Location>(`/locations/${locationId}`)
  return data
}

export async function createLocation(payload: CreateLocation): Promise<CreatedLocation> {
  const { data } = await api.post<CreatedLocation>('/locations', payload)
  return data
}
