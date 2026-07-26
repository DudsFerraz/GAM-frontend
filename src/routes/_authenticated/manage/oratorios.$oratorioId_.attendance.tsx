import { createFileRoute } from '@tanstack/react-router'

import { OratorioAttendancePage } from '@/features/manage/oratorios'

export const Route = createFileRoute(
  '/_authenticated/manage/oratorios/$oratorioId_/attendance',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { oratorioId } = Route.useParams()
  return <OratorioAttendancePage oratorioId={oratorioId} />
}
