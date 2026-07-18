import { CalendarDays, ClipboardCheck, ShieldCheck } from 'lucide-react'

import { EmptyState, LoadingState } from '@/components/AsyncState'
import { Card, CardContent } from '@/components/ui/Card'
import { useAccountInfo, useAccountPermissions, getMainRoleLabel } from '@/features/account'
import { useEvents } from '@/features/manage/events'
import { useSolicitations } from '@/features/manage/solicitations'

import { DashboardHero } from '../components/DashboardHero'
import { MetricCard } from '../components/MetricCard'
import { QuickAccessGrid } from '../components/QuickAccessGrid'
import { UpcomingEvents } from '../components/UpcomingEvents'
import purposeImage from '@/assets/images/criancas_oratorio.jpeg'

const upcomingEventFilters = {
  title: '',
  status: 'SCHEDULED',
  type: 'ALL',
} as const

export function AuthenticatedHomePage() {
  const { account, isLoading } = useAccountInfo()
  const { permissions } = useAccountPermissions(account)
  const canSeeEvents = permissions.includes('EVENT_SEARCH')
  const canManageMembers = permissions.includes('MEMBER_SEARCH')
  const canManageAccounts = permissions.includes('ACCOUNT_SEARCH')

  const eventQuery = useEvents(upcomingEventFilters, 0, canSeeEvents)
  const pendingSolicitationsQuery = useSolicitations('PENDING', 0)

  if (isLoading) {
    return <LoadingState title="Carregando seu painel..." description="Estamos preparando as informações mais importantes para você." />
  }

  if (!account) {
    return <EmptyState title="Painel indisponível." description="Não foi possível carregar os dados da conta autenticada." />
  }

  const upcomingEvents = [...(eventQuery.data?.items ?? [])]
    .filter((event) => event.status === 'SCHEDULED')
    .sort((first, second) => {
      const firstTime = first.beginDate ? new Date(first.beginDate).getTime() : Number.MAX_SAFE_INTEGER
      const secondTime = second.beginDate ? new Date(second.beginDate).getTime() : Number.MAX_SAFE_INTEGER
      return firstTime - secondTime
    })
    .slice(0, 4)

  const pendingCount = pendingSolicitationsQuery.data?.totalElements ?? pendingSolicitationsQuery.data?.items?.length ?? 0
  const pendingValue = pendingSolicitationsQuery.isError ? '—' : pendingCount
  const pendingDescription = pendingSolicitationsQuery.isError
    ? 'Atualização indisponível no momento'
    : pendingCount === 1
      ? 'solicitação aguardando análise'
      : 'solicitações aguardando análise'

  const eventValue = eventQuery.isError ? '—' : eventQuery.data?.totalElements ?? 0
  const eventDescription = eventQuery.isError
    ? 'A programação não pôde ser atualizada'
    : 'eventos agendados para acompanhar'

  return (
    <div className="space-y-8 py-2 sm:py-4">
      <DashboardHero canSeeEvents={canSeeEvents} displayName={account.displayName} />

      <section aria-label="Resumo da sua conta" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          description={eventDescription}
          icon={CalendarDays}
          label="Próximos eventos"
          value={eventValue}
        />
        <MetricCard
          description={pendingDescription}
          icon={ClipboardCheck}
          label="Solicitações pendentes"
          value={pendingValue}
        />
        <MetricCard
          description="Seu tipo principal de acesso na plataforma"
          icon={ShieldCheck}
          label="Seu acesso"
          value={getMainRoleLabel(account.roles)}
        />
      </section>

      <div className={`grid gap-6 ${canSeeEvents ? 'xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]' : 'xl:max-w-2xl'}`}>
        {canSeeEvents && (
          <UpcomingEvents
            events={upcomingEvents}
            isError={eventQuery.isError}
            isLoading={eventQuery.isLoading}
            onRetry={() => void eventQuery.refetch()}
          />
        )}

        <Card className="group overflow-hidden py-0 shadow-sm">
          <div className="relative h-52 overflow-hidden">
            <img
              alt="Crianças participando de uma atividade no oratório"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={purposeImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#092c4a] via-[#092c4a]/35 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white sm:left-6 sm:right-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">Nosso propósito</p>
              <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">Estar junto faz diferença.</h2>
            </div>
          </div>
          <CardContent className="p-5 sm:p-6">
            <p className="text-sm leading-6 text-muted-foreground">
              Cada atividade, cadastro e encontro ajuda a fortalecer uma comunidade mais presente, acolhedora e participativa.
            </p>
          </CardContent>
        </Card>
      </div>

      <QuickAccessGrid canManageAccounts={canManageAccounts} canManageMembers={canManageMembers} canSeeEvents={canSeeEvents} />
    </div>
  )
}
