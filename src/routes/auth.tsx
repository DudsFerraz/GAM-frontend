import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'

import { LoadingState } from '@/components/AsyncState'
import { useAuth } from '@/features/auth'

export const Route = createFileRoute('/auth')({
  component: AuthLayoutWrapper,
})

function AuthLayoutWrapper() {
  const { status } = useAuth()

  if (status === 'initializing') {
    return <div className="flex min-h-screen items-center justify-center p-6"><LoadingState title="Verificando sua sessão..." /></div>
  }

  if (status === 'authenticated') {
    return <Navigate replace to="/home" />
  }

  return <Outlet />
}
