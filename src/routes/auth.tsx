import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  component: AuthLayoutWrapper,
})

function AuthLayoutWrapper() {
  return (
    <Outlet />
  )
}