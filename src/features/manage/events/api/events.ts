import type { components } from "@/api/generated/gam-api";
import { api } from "@/lib/http";

export type Event = components["schemas"]["EventRDTO"];
export type EventPage = components["schemas"]["PagedResponseEventRDTO"];
export type CreateEvent = components["schemas"]["CreateGenericEventDTO"];
export type CreatedEvent = Event;
export type EventReplacement = components["schemas"]["EventReplacementDTO"];
export type EventReason = components["schemas"]["EventReasonDTO"];
export type ReopenEvent = components["schemas"]["ReopenEventDTO"];
export type EventStatus = NonNullable<Event["status"]>;
export type EventType = NonNullable<Event["type"]>;
export type Presence = components["schemas"]["PresenceRDTO"];
export type PresencePage = components["schemas"]["PagedResponsePresenceRDTO"];
export type RegisterPresence =
  components["schemas"]["RegisterPresenceRequestDTO"];
export type RegisteredPresence =
  components["schemas"]["RegisterPresenceRDTO"];
export type UpdatePresenceObservations =
  components["schemas"]["UpdatePresenceObservationsDTO"];
export type RemovePresence = components["schemas"]["RemovePresenceDTO"];

export type EventFilters = {
  title: string;
  status: EventStatus | "ALL";
  type: EventType | "ALL";
};

export type EventSearch = {
  filters: EventFilters;
  sorts: string[];
};

const EVENT_SORT_FIELDS = [
  "title",
  "beginDate",
  "endDate",
  "type",
  "status",
] as const;

function isSupportedEventSort(value: string): boolean {
  const [field, direction, ...rest] = value.split(",");
  return (
    rest.length === 0 &&
    EVENT_SORT_FIELDS.some((allowedField) => allowedField === field) &&
    (direction === "asc" || direction === "desc")
  );
}

export async function searchEvents(
  search: EventSearch,
  page: number,
): Promise<EventPage> {
  const apiFilters: components["schemas"]["SpecificationFilterDTO"][] = [];
  if (search.filters.title.trim())
    apiFilters.push({
      field: "title",
      value: search.filters.title.trim(),
      comparisonMethod: "LIKE",
    });
  if (search.filters.status !== "ALL")
    apiFilters.push({
      field: "status",
      value: search.filters.status,
      comparisonMethod: "EQUALS",
    });
  if (search.filters.type !== "ALL")
    apiFilters.push({
      field: "type",
      value: search.filters.type,
      comparisonMethod: "EQUALS",
    });
  const requestedSorts = search.sorts.filter(isSupportedEventSort);
  const { data } = await api.post<EventPage>(
    "/events/search",
    { filters: apiFilters },
    {
      params: {
        page,
        size: 12,
        sort: requestedSorts.length > 0 ? requestedSorts : ["beginDate,desc"],
      },
      paramsSerializer: { indexes: null },
    },
  );
  return data;
}

export async function getEvent(eventId: string): Promise<Event> {
  const { data } = await api.get<Event>(`/events/${eventId}`);
  return data;
}

export async function createEvent(payload: CreateEvent): Promise<CreatedEvent> {
  const { data } = await api.post<CreatedEvent>("/events", payload);
  return data;
}

export async function replaceEvent(
  eventId: string,
  payload: EventReplacement,
): Promise<Event> {
  const { data } = await api.put<Event>(`/events/${eventId}`, payload);
  return data;
}

export async function lockEvent(eventId: string): Promise<Event> {
  const { data } = await api.patch<Event>(`/events/${eventId}/lock`);
  return data;
}

export async function finalizeEvent(eventId: string): Promise<Event> {
  const { data } = await api.patch<Event>(`/events/${eventId}/finalize`);
  return data;
}

export async function reopenEvent(
  eventId: string,
  payload: ReopenEvent,
): Promise<Event> {
  const { data } = await api.patch<Event>(`/events/${eventId}/reopen`, payload);
  return data;
}

export async function cancelEvent(
  eventId: string,
  payload: EventReason,
): Promise<Event> {
  const { data } = await api.patch<Event>(`/events/${eventId}/cancel`, payload);
  return data;
}

export async function removeEvent(
  eventId: string,
  payload: EventReason,
): Promise<void> {
  await api.delete(`/events/${eventId}`, { data: payload });
}

export async function getEventPresences(
  eventId: string,
  page: number,
): Promise<PresencePage> {
  const { data } = await api.get<PresencePage>(`/events/${eventId}/presences`, {
    params: { page, size: 12, sort: ["registeredAt,asc"] },
    paramsSerializer: { indexes: null },
  });
  return data;
}

export async function registerEventPresence(
  eventId: string,
  payload: RegisterPresence,
): Promise<RegisteredPresence> {
  const { data } = await api.post<RegisteredPresence>(
    `/events/${eventId}/presences`,
    payload,
  );
  return data;
}

export async function getEventPresence(
  eventId: string,
  memberId: string,
): Promise<Presence> {
  const { data } = await api.get<Presence>(
    `/events/${eventId}/presences/${memberId}`,
  );
  return data;
}

export async function updateEventPresenceObservations(
  eventId: string,
  memberId: string,
  payload: UpdatePresenceObservations,
): Promise<Presence> {
  const { data } = await api.patch<Presence>(
    `/events/${eventId}/presences/${memberId}`,
    payload,
  );
  return data;
}

export async function removeEventPresence(
  eventId: string,
  memberId: string,
  payload: RemovePresence,
): Promise<void> {
  await api.delete(`/events/${eventId}/presences/${memberId}`, {
    data: payload,
  });
}
