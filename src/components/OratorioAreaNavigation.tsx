import { Link, useRouterState } from '@tanstack/react-router'
import { CalendarDays, UsersRound } from 'lucide-react'

import { useAccountInfo, useAccountPermissions } from '@/features/account'
import { cn } from '@/lib/utils'

export function OratorioAreaNavigation() {
  const { account } = useAccountInfo()
  const { permissions } = useAccountPermissions(account)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const canViewOratorios = permissions.includes('ORATORIO_GET')
  const canViewOratorianos = permissions.includes('ORATORIANO_GET')
  const isOratorianos = pathname.startsWith(
    '/manage/oratorios/oratorianos',
  )

  return (
    <nav
      aria-label="Seções do Oratório"
      className="flex gap-1 overflow-x-auto rounded-xl border bg-muted/40 p-1"
    >
      {canViewOratorios && (
        <Link
          aria-current={!isOratorianos ? 'page' : undefined}
          className={cn(
            'flex min-h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            !isOratorianos
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
          )}
          to="/manage/oratorios"
        >
          <CalendarDays aria-hidden="true" className="h-4 w-4" />
          Ocorrências
        </Link>
      )}
      {canViewOratorianos && (
        <Link
          aria-current={isOratorianos ? 'page' : undefined}
          className={cn(
            'flex min-h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isOratorianos
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
          )}
          to="/manage/oratorios/oratorianos"
        >
          <UsersRound aria-hidden="true" className="h-4 w-4" />
          Oratorianos
        </Link>
      )}
    </nav>
  )
}
