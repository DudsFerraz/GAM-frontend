import { createFileRoute } from '@tanstack/react-router'

import { OratorioAreaLayout } from '@/components/OratorioAreaLayout'

export const Route = createFileRoute(
  '/_authenticated/manage/oratorios',
)({
  component: OratorioAreaLayout,
})
