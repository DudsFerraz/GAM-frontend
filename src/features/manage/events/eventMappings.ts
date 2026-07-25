import type { CreateEvent } from './api/events'
import type { EventFormValues } from './schemas/eventSchema'

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
