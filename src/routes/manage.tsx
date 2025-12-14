import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/manage')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Outlet />
  )
}
