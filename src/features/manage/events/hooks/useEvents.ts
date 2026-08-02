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
  registerEventPresence,
  removeEventPresence,
  removeEvent,
  reopenEvent,
  replaceEvent,
  searchEvents,
  updateEventPresenceObservations,
  type EventSearch,
  type EventReplacement,
} from "../api/events";
import { memberQueryKeys } from "@/features/manage/members/queryKeys";
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

export function useEvents(search: EventSearch, page: number, enabled = true) {
  return useQuery({
    queryKey: eventQueryKeys.search(search, page),
    queryFn: ({ signal }) => searchEvents(search, page, 12, signal),
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

// Invalidate presence history for both event and member queries after a mutation
async function invalidatePresenceHistory(
  queryClient: ReturnType<typeof useQueryClient>,
  eventId: string,
  memberId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: eventQueryKeys.presenceLists(eventId),
    }),
    queryClient.invalidateQueries({
      queryKey: memberQueryKeys.presenceLists(memberId),
    }),
  ]);
}

export function useRegisterEventPresence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      memberId,
      observations,
    }: {
      eventId: string;
      memberId: string;
      observations: string | null;
    }) => registerEventPresence(eventId, { memberId, observations }),
    onSuccess: (_, { eventId, memberId }) =>
      invalidatePresenceHistory(queryClient, eventId, memberId),
  });
}

export function useUpdateEventPresenceObservations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      memberId,
      observations,
    }: {
      eventId: string;
      memberId: string;
      observations: string | null;
    }) => updateEventPresenceObservations(eventId, memberId, { observations }),
    onSuccess: (_, { eventId, memberId }) =>
      invalidatePresenceHistory(queryClient, eventId, memberId),
  });
}

export function useRemoveEventPresence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      memberId,
      reason,
    }: {
      eventId: string;
      memberId: string;
      reason: string;
    }) => removeEventPresence(eventId, memberId, { reason }),
    onSuccess: (_, { eventId, memberId }) =>
      invalidatePresenceHistory(queryClient, eventId, memberId),
  });
}
