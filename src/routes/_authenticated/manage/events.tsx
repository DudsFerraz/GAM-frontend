import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { ManageEventsPage } from '@/features/manage/events'

export const Route = createFileRoute('/_authenticated/manage/events')({
  validateSearch: z.object({
    eventId: z.string().optional(),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { eventId } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <ManageEventsPage
      onSelectedEventIdChange={(selectedEventId) => {
        void navigate({
          replace: true,
          search: (current) => ({ ...current, eventId: selectedEventId ?? undefined }),
        })
      }}
      selectedEventId={eventId ?? null}
    />
  )
}
