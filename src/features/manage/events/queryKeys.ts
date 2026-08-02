import type { EventSearch } from "./api/events";

export const eventQueryKeys = {
  all: ["events"] as const,
  search: (search: EventSearch, page: number) =>
    [...eventQueryKeys.all, "search", search, page] as const,
  oratorioDateSearch: (search: EventSearch, term: string) =>
    [...eventQueryKeys.all, "oratorio-date-search", search, term] as const,
  detail: (eventId: string) =>
    [...eventQueryKeys.all, "detail", eventId] as const,
  presenceLists: (eventId: string) =>
    [...eventQueryKeys.detail(eventId), "presences"] as const,
  presences: (eventId: string, page: number) =>
    [...eventQueryKeys.presenceLists(eventId), page] as const,
};
