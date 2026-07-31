import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import {
  ManageOratorianosPage,
  ORATORIANO_PROFILE_NOTICE_VALUES,
} from '@/features/manage/oratorianos'

export const Route = createFileRoute(
  '/_authenticated/manage/oratorios/oratorianos',
)({
  validateSearch: z.object({
    notice: z.enum(ORATORIANO_PROFILE_NOTICE_VALUES)
      .optional()
      .catch(undefined),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { notice } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <ManageOratorianosPage
      initialNotice={notice}
      onNoticeDismiss={() => {
        void navigate({
          replace: true,
          search: (current) => ({ ...current, notice: undefined }),
        })
      }}
    />
  )
}
