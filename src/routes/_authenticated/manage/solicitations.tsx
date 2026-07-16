import { createFileRoute } from '@tanstack/react-router'

import { ManageSolicitationsPage } from '@/features/manage/solicitations'

export const Route = createFileRoute('/_authenticated/manage/solicitations')({
  component: ManageSolicitationsPage,
})
