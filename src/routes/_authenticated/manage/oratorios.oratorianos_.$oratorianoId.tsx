import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import {
  OratorianoDetailPage,
  ORATORIANO_PROFILE_NOTICE_VALUES,
} from '@/features/manage/oratorianos'

export const Route = createFileRoute(
  '/_authenticated/manage/oratorios/oratorianos_/$oratorianoId',
)({
  validateSearch: z.object({
    notice: z.enum(ORATORIANO_PROFILE_NOTICE_VALUES)
      .optional()
      .catch(undefined),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { oratorianoId } = Route.useParams()
  const { notice } = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <OratorianoDetailPage
      initialNotice={notice}
      onNoticeDismiss={() => {
        void navigate({
          replace: true,
          search: (current) => ({ ...current, notice: undefined }),
        })
      }}
      oratorianoId={oratorianoId}
    />
  )
}
