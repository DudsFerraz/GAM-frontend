import type { Event } from "./api/events";

const ATTENDANCE_OPEN_STATUSES = ["SCHEDULED", "COMPLETED"] as const;
const ATTENDANCE_MUTABLE_STATUSES = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
] as const;

export function canRegisterPresence(
  event: Event,
  evaluationInstant = new Date(),
): boolean {
  if (
    !event.status ||
    !ATTENDANCE_OPEN_STATUSES.some((status) => status === event.status) ||
    !event.beginDate ||
    !event.type
  ) {
    return false;
  }

  const beginDate = new Date(event.beginDate);
  if (Number.isNaN(beginDate.getTime())) {
    return false;
  }

  const registrationBoundary =
    event.type === "ORATORIO"
      ? new Date(beginDate.getTime() - 30 * 60 * 1000)
      : beginDate;

  return evaluationInstant >= registrationBoundary;
}

export function canChangePresence(event: Event): boolean {
  return Boolean(
    event.status &&
    ATTENDANCE_MUTABLE_STATUSES.some((status) => status === event.status),
  );
}
