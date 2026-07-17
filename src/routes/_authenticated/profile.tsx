import { createFileRoute } from '@tanstack/react-router'

import { AccountProfilePage } from '@/features/account'

export const Route = createFileRoute('/_authenticated/profile')({
  component: AccountProfilePage,
})
