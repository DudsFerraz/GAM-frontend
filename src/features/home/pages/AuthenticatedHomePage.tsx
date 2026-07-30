import { EmptyState, LoadingState } from '@/components/AsyncState'
import { getMainRoleLabel, useAccountInfo } from '@/features/account'

import { DashboardHero } from '../components/DashboardHero'

export function AuthenticatedHomePage() {
  const { account, isLoading } = useAccountInfo()

  if (isLoading) {
    return <LoadingState title="Carregando seu painel..." description="Estamos preparando as informações mais importantes para você." />
  }

  if (!account) {
    return <EmptyState title="Painel indisponível." description="Não foi possível carregar os dados da conta autenticada." />
  }

  if (!account.displayName.trim() || !account.roles?.length) {
    return <EmptyState title="Painel indisponível." description="Os dados essenciais da conta não estão disponíveis." />
  }

  return (
    <div className="h-[calc(100dvh-6.5rem)] md:h-full">
      <DashboardHero
        accessLabel={getMainRoleLabel(account.roles)}
        displayName={account.displayName}
      />
    </div>
  )
}
