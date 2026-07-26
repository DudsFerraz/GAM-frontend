import { createFileRoute } from '@tanstack/react-router'

import { OratorioDetailPage } from '@/features/manage/oratorios'

export const Route = createFileRoute(
  '/_authenticated/manage/oratorios/$oratorioId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { oratorioId } = Route.useParams()
  return <OratorioDetailPage oratorioId={oratorioId} />
}
