import { createFileRoute, Navigate, useRouterState } from '@tanstack/react-router'
import { AppLayout } from '@/app/shell'
import { LoadingState } from '@/components/AsyncState'
import { useAuth } from '@/features/auth'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { status } = useAuth()
  const location = useRouterState({ select: (state) => state.location })

  if (status === 'initializing') {
    return <div className="flex min-h-screen items-center justify-center p-6"><LoadingState title="Restaurando sua sessão..." /></div>
  }

  if (status === 'unauthenticated') {
    return <Navigate replace search={{ redirect: location.href }} to="/auth/login" />
  }

  return <AppLayout />
}
