import { createFileRoute } from '@tanstack/react-router'

import { MemberDetailPage } from '@/features/manage/members'

export const Route = createFileRoute('/_authenticated/manage/members/$memberId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { memberId } = Route.useParams()
  return <MemberDetailPage memberId={memberId} />
}
