import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '@/components/appLayout'

export const Route = createFileRoute('/manage')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AppLayout/>
  )
}
