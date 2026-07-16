import { createFileRoute } from '@tanstack/react-router'

import { EventDetailPage } from '@/features/manage/events'

export const Route = createFileRoute('/_authenticated/manage/events/$eventId')({ component: RouteComponent })

function RouteComponent() {
  const { eventId } = Route.useParams()
  return <EventDetailPage eventId={eventId} />
}
