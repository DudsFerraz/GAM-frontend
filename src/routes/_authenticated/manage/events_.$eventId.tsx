import { createFileRoute } from '@tanstack/react-router'

import { EventDetailPage } from '@/features/manage/events'

// The trailing "_" in the file name keeps this URL outside the list route,
// whose component intentionally does not render an Outlet.
export const Route = createFileRoute('/_authenticated/manage/events_/$eventId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { eventId } = Route.useParams()
  return <EventDetailPage eventId={eventId} />
}
