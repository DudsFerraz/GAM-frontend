import { AxiosInterceptor } from '@/features/auth'
import { ErrorState, EmptyState } from '@/components/AsyncState'
import { Button } from '@/components/ui/Button'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

const RouterDevtools = import.meta.env.DEV
  ? lazy(async () => {
      const module = await import('@tanstack/react-router-devtools')
      return { default: module.TanStackRouterDevtools }
    })
  : null

export const Route = createRootRoute({
  errorComponent: ({ reset }) => (
    <main className="flex min-h-screen items-center justify-center p-6">
      <ErrorState
        className="max-w-xl"
        description="A página encontrou um problema inesperado. Tente novamente."
        onRetry={reset}
        title="Não foi possível exibir esta página."
      />
    </main>
  ),
  notFoundComponent: () => (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <EmptyState
        className="max-w-xl"
        description="Confira o endereço ou volte para a página inicial."
        title="Página não encontrada."
      />
      <Button asChild><Link to="/">Voltar ao início</Link></Button>
    </main>
  ),
  component: () => (
    <>
      <AxiosInterceptor>
        <Outlet />
      </AxiosInterceptor>

      {RouterDevtools && (
        <Suspense fallback={null}>
          <RouterDevtools />
        </Suspense>
      )}
    </>
  ),
})
