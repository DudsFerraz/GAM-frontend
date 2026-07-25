import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  cancelEvent,
  createEvent,
  finalizeEvent,
  getEvent,
  getEventPresences,
  lockEvent,
  removeEvent,
  reopenEvent,
  replaceEvent,
  searchEvents,
  type EventFilters,
  type EventReplacement,
} from "../api/events";
import { eventQueryKeys } from "../queryKeys";

export type EventLifecycleCommand =
  | { action: "lock" | "finalize"; eventId: string }
  | { action: "cancel"; eventId: string; reason: string }
  | {
      action: "reopen";
      eventId: string;
      reason: string;
      targetStatus: "LOCKED" | "COMPLETED";
    };

export function useEvents(filters: EventFilters, page: number, enabled = true) {
  return useQuery({
    queryKey: eventQueryKeys.search(filters, page),
    queryFn: () => searchEvents(filters, page),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useEvent(eventId: string | null) {
  return useQuery({
    queryKey: eventQueryKeys.detail(eventId ?? ""),
    queryFn: () => getEvent(eventId ?? ""),
    enabled: Boolean(eventId),
  });
}

export function useEventPresences(
  eventId: string,
  page: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: eventQueryKeys.presences(eventId, page),
    queryFn: () => getEventPresences(eventId, page),
    enabled: Boolean(eventId) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.all }),
  });
}

export function useReplaceEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: string;
      payload: EventReplacement;
    }) => replaceEvent(eventId, payload),
    onSuccess: (event, { eventId }) => {
      queryClient.setQueryData(eventQueryKeys.detail(eventId), event);
      return queryClient.invalidateQueries({ queryKey: eventQueryKeys.all });
    },
  });
}

export function useEventLifecycleCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (command: EventLifecycleCommand) => {
      switch (command.action) {
        case "lock":
          return lockEvent(command.eventId);
        case "finalize":
          return finalizeEvent(command.eventId);
        case "cancel":
          return cancelEvent(command.eventId, { reason: command.reason });
        case "reopen":
          return reopenEvent(command.eventId, {
            reason: command.reason,
            targetStatus: command.targetStatus,
          });
      }
    },
    onSuccess: (event, { eventId }) => {
      queryClient.setQueryData(eventQueryKeys.detail(eventId), event);
      return queryClient.invalidateQueries({ queryKey: eventQueryKeys.all });
    },
  });
}

export function useRemoveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, reason }: { eventId: string; reason: string }) =>
      removeEvent(eventId, { reason }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.all }),
  });
}
