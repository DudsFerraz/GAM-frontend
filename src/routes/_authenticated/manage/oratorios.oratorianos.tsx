import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { z } from 'zod'

import { ManageOratorianosPage } from '@/features/manage/oratorianos'

export const Route = createFileRoute(
  '/_authenticated/manage/oratorios/oratorianos',
)({
  validateSearch: z.object({
    notice: z.literal('oratoriano-excluido').optional().catch(undefined),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { notice } = Route.useSearch()
  const navigate = Route.useNavigate()
  const hasDeletionNotice = notice === 'oratoriano-excluido'

  useEffect(() => {
    if (!hasDeletionNotice) {
      return
    }

    void navigate({
      replace: true,
      search: (current) => ({ ...current, notice: undefined }),
    })
  }, [hasDeletionNotice, navigate])

  return (
    <ManageOratorianosPage
      initialDeletionNotice={hasDeletionNotice}
    />
  )
}
