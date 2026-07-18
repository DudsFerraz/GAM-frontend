import { createFileRoute } from '@tanstack/react-router'

import { AuthenticatedHomePage } from '@/features/home'

export const Route = createFileRoute("/_authenticated/home")({
  component: AuthenticatedHomePage,
})
