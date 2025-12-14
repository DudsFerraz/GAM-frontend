import { createFileRoute } from '@tanstack/react-router'
import { SearchMembers } from '@/features/manage/members/components/searchMembers'

export const Route = createFileRoute('/manage/members')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SearchMembers/>
  )
}
