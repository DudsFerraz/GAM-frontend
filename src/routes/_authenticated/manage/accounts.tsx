import { createFileRoute } from '@tanstack/react-router'

import { ManageAccountsPage } from '@/features/manage/accounts'

export const Route = createFileRoute('/_authenticated/manage/accounts')({
  component: ManageAccountsPage,
})
