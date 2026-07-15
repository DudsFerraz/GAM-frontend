import { createFileRoute } from '@tanstack/react-router'
import { ManageMembersPage } from '@/features/manage/members'

export const Route = createFileRoute('/_authenticated/manage/members')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ManageMembersPage />
}
