import type { CreateEvent, Event, EventReplacement } from './api/events'
import type { EventEditFormValues, EventFormValues } from './schemas/eventSchema'

export function mapEventFormToCreateEvent(values: EventFormValues): CreateEvent {
  return {
    title: values.title,
    ...(values.description ? { description: values.description } : {}),
    gamLocationId: values.locationId,
    ...(values.requiredPermissionId
      ? { requiredPermissionId: values.requiredPermissionId }
      : {}),
    beginDate: new Date(values.beginDate).toISOString(),
    endDate: new Date(values.endDate).toISOString(),
  }
}

function toDateTimeLocalValue(value?: string | null): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 16)
}

export function mapEventToEditForm(event: Event): EventEditFormValues {
  return {
    title: event.title ?? '',
    description: event.description ?? '',
    locationId: event.gamLocation?.id ?? '',
    requiredPermissionId: event.requiredPermission?.id ?? '',
    beginDate: toDateTimeLocalValue(event.beginDate),
    endDate: toDateTimeLocalValue(event.endDate),
    reason: '',
  }
}

export function mapEventEditFormToReplacement(
  values: EventEditFormValues,
): EventReplacement {
  return {
    title: values.title,
    ...(values.description ? { description: values.description } : {}),
    gamLocationId: values.locationId,
    ...(values.requiredPermissionId
      ? { requiredPermissionId: values.requiredPermissionId }
      : {}),
    beginDate: new Date(values.beginDate).toISOString(),
    endDate: new Date(values.endDate).toISOString(),
    ...(values.reason ? { reason: values.reason } : {}),
  }
}
