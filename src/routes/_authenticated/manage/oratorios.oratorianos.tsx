import { createFileRoute } from '@tanstack/react-router'

import { ManageOratorianosPage } from '@/features/manage/oratorianos'

export const Route = createFileRoute(
  '/_authenticated/manage/oratorios/oratorianos',
)({
  component: ManageOratorianosPage,
})
