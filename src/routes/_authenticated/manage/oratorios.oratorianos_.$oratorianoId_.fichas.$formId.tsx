import { createFileRoute } from '@tanstack/react-router'

import { OratorianoFormPage } from '@/features/manage/oratorianoForms'

export const Route = createFileRoute(
  '/_authenticated/manage/oratorios/oratorianos_/$oratorianoId_/fichas/$formId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { formId, oratorianoId } = Route.useParams()

  return (
    <OratorianoFormPage
      formId={formId}
      openedExplicitly
      oratorianoId={oratorianoId}
    />
  )
}
