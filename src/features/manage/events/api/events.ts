import type { components } from "@/api/generated/gam-api";
import { api } from "@/lib/http";

export type Event = components["schemas"]["EventRDTO"];
export type EventPage = components["schemas"]["PagedResponseEventRDTO"];
export type CreateEvent = components["schemas"]["CreateEventDTO"];
export type CreatedEvent = components["schemas"]["CreateEventRDTO"];
export type EventStatus = NonNullable<Event["status"]>;
export type EventType = NonNullable<Event["type"]>;
export type PresencePage = components["schemas"]["PagedResponsePresenceRDTO"];

export type EventFilters = {
  title: string;
  status: EventStatus | "ALL";
  type: EventType | "ALL";
};

export async function searchEvents(
  filters: EventFilters,
  page: number,
): Promise<EventPage> {
  const apiFilters: components["schemas"]["SpecificationFilterDTO"][] = [];
  if (filters.title.trim())
    apiFilters.push({
      field: "title",
      value: filters.title.trim(),
      comparationMethod: "LIKE",
    });
  if (filters.status !== "ALL")
    apiFilters.push({
      field: "status",
      value: filters.status,
      comparationMethod: "EQUALS",
    });
  if (filters.type !== "ALL")
    apiFilters.push({
      field: "type",
      value: filters.type,
      comparationMethod: "EQUALS",
    });
  const { data } = await api.post<EventPage>(
    "/events/search",
    { filters: apiFilters },
    {
      params: { page, size: 12, sort: ["beginDate,desc"] },
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

export async function getEventPresences(
  eventId: string,
  page: number,
): Promise<PresencePage> {
  const { data } = await api.get<PresencePage>(`/events/${eventId}/presences`, {
    params: { page, size: 12, sort: ["createdAt,asc"] },
    paramsSerializer: { indexes: null },
  });
  return data;
}
