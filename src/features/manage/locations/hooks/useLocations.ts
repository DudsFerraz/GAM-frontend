import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createLocation, getLocation, getLocations } from '../api/locations'
import { locationQueryKeys } from '../queryKeys'

export function useLocations(page: number) {
  return useQuery({ queryKey: locationQueryKeys.page(page), queryFn: () => getLocations(page), placeholderData: keepPreviousData })
}

export function useLocationOptions() {
  return useQuery({ queryKey: locationQueryKeys.options(), queryFn: () => getLocations(0, 100), staleTime: 1000 * 60 * 5 })
}

export function useLocation(locationId: string) {
  return useQuery({ queryKey: locationQueryKeys.detail(locationId), queryFn: () => getLocation(locationId), enabled: Boolean(locationId) })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: createLocation, onSuccess: () => queryClient.invalidateQueries({ queryKey: locationQueryKeys.all }) })
}
