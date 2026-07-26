import { createFileRoute } from '@tanstack/react-router'

import { OratorianoDetailPage } from '@/features/manage/oratorianos'

export const Route = createFileRoute(
  '/_authenticated/manage/oratorios/oratorianos_/$oratorianoId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { oratorianoId } = Route.useParams()
  return <OratorianoDetailPage oratorianoId={oratorianoId} />
}
