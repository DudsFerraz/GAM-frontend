import type { Event } from "./api/events";

const ATTENDANCE_OPEN_STATUSES = ["SCHEDULED", "COMPLETED"] as const;
const ATTENDANCE_MUTABLE_STATUSES = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
] as const;
const UNAVAILABLE_REGISTRATION_MESSAGE =
  "Não foi possível determinar a janela de presença deste evento. Atualize a página e tente novamente.";

export type PresenceRegistrationAvailability =
  | { state: "available"; message: null }
  | { state: "before-window"; message: string }
  | { state: "closed-status"; message: string }
  | { state: "unavailable"; message: string };

export function getPresenceRegistrationAvailability(
  event: Event,
  evaluationInstant = new Date(),
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
    !ATTENDANCE_OPEN_STATUSES.some((status) => status === event.status) ||
    !event.beginDate ||
    !event.type
  ) {
    return {
      state: "unavailable",
      message: UNAVAILABLE_REGISTRATION_MESSAGE,
    };
  }

  const beginDate = new Date(event.beginDate);
  if (
    Number.isNaN(beginDate.getTime()) ||
    Number.isNaN(evaluationInstant.getTime())
  ) {
    return {
      state: "unavailable",
      message: UNAVAILABLE_REGISTRATION_MESSAGE,
    };
  }

  const registrationBoundary =
    event.type === "ORATORIO"
      ? new Date(beginDate.getTime() - 30 * 60 * 1000)
      : beginDate;

  if (evaluationInstant < registrationBoundary) {
    return {
      state: "before-window",
      message:
        "O registro ficará disponível quando a janela de presença deste evento estiver aberta.",
    };
  }

  return { state: "available", message: null };
}

export function canRegisterPresence(
  event: Event,
  evaluationInstant = new Date(),
): boolean {
  return getPresenceRegistrationAvailability(event, evaluationInstant).state ===
    "available";
}

export function canChangePresence(event: Event): boolean {
  return Boolean(
    event.status &&
    ATTENDANCE_MUTABLE_STATUSES.some((status) => status === event.status),
  );
}
