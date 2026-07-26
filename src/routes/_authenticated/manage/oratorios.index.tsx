import { createFileRoute } from '@tanstack/react-router'

import { ManageOratoriosPage } from '@/features/manage/oratorios'

export const Route = createFileRoute(
  '/_authenticated/manage/oratorios/',
)({
  component: ManageOratoriosPage,
})
