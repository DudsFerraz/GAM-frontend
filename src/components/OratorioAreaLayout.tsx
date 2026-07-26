import { Outlet } from '@tanstack/react-router'

import { OratorioAreaNavigation } from './OratorioAreaNavigation'

export function OratorioAreaLayout() {
  return (
    <div className="space-y-4 py-2 sm:py-4">
      <OratorioAreaNavigation />
      <Outlet />
    </div>
  )
}
