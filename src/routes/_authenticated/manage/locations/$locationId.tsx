import { createFileRoute } from '@tanstack/react-router'

import { LocationDetailPage } from '@/features/manage/locations'

export const Route = createFileRoute('/_authenticated/manage/locations/$locationId')({ component: RouteComponent })

function RouteComponent() {
  const { locationId } = Route.useParams()
  return <LocationDetailPage locationId={locationId} />
}
