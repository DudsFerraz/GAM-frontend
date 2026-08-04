import type { Event } from "./api/events";

const ATTENDANCE_OPEN_STATUSES = ["SCHEDULED", "COMPLETED"] as const;
const ATTENDANCE_MUTABLE_STATUSES = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
] as const;
const UNAVAILABLE_REGISTRATION_MESSAGE =
  "Não foi possível determinar a disponibilidade do registro de presença deste evento. Atualize a página e tente novamente.";

export type PresenceRegistrationAvailability =
  | { state: "available"; message: null }
  | { state: "closed-status"; message: string }
  | { state: "unavailable"; message: string };

export function getPresenceRegistrationAvailability(
  event: Event,
): PresenceRegistrationAvailability {
  if (event.status === "CANCELLED") {
    return {
      state: "closed-status",
      message:
        "Este evento foi cancelado e não aceita novos registros de presença.",
    };
  }

  if (event.status === "LOCKED") {
    return {
      state: "closed-status",
      message:
        "As presenças deste evento estão bloqueadas e não aceitam novos registros.",
    };
  }

  if (event.status === "FINALIZED") {
    return {
      state: "closed-status",
      message:
        "Este evento foi finalizado e não aceita novos registros de presença.",
    };
  }

  if (
    !event.status ||
    !ATTENDANCE_OPEN_STATUSES.some((status) => status === event.status)
  ) {
    return {
      state: "unavailable",
      message: UNAVAILABLE_REGISTRATION_MESSAGE,
    };
  }

  return { state: "available", message: null };
}

export function canRegisterPresence(event: Event): boolean {
  return getPresenceRegistrationAvailability(event).state === "available";
}

export function canChangePresence(event: Event): boolean {
  return Boolean(
    event.status &&
    ATTENDANCE_MUTABLE_STATUSES.some((status) => status === event.status),
  );
}
