import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createEvent, getEvent, getEventPresences, searchEvents, type EventFilters } from '../api/events'
import { eventQueryKeys } from '../queryKeys'

export function useEvents(filters: EventFilters, page: number) {
  return useQuery({ queryKey: eventQueryKeys.search(filters, page), queryFn: () => searchEvents(filters, page), placeholderData: keepPreviousData })
}

export function useEvent(eventId: string) {
  return useQuery({ queryKey: eventQueryKeys.detail(eventId), queryFn: () => getEvent(eventId), enabled: Boolean(eventId) })
}

export function useEventPresences(eventId: string, page: number, enabled: boolean) {
  return useQuery({ queryKey: eventQueryKeys.presences(eventId, page), queryFn: () => getEventPresences(eventId, page), enabled: Boolean(eventId) && enabled, placeholderData: keepPreviousData })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: createEvent, onSuccess: () => queryClient.invalidateQueries({ queryKey: eventQueryKeys.all }) })
}
