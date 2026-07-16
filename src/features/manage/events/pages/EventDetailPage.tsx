import { Link } from '@tanstack/react-router'
import { ArrowLeft, CalendarDays, MapPin, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'

import { EmptyState, ErrorState, ForbiddenState, LoadingState } from '@/components/AsyncState'
import { Pagination } from '@/components/Pagination'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAccountInfo, useAccountPermissions } from '@/features/account'
import { formatDateTime } from '@/lib/format'
import { isForbiddenError } from '@/lib/http'

import { useEvent, useEventPresences } from '../hooks/useEvents'

export function EventDetailPage({ eventId }: { eventId: string }) {
  const [page, setPage] = useState(0)
  const { account } = useAccountInfo()
  const { permissions } = useAccountPermissions(account)
  const canViewPresences = permissions.includes('EVENT_GET_PRESENCES')
  const eventQuery = useEvent(eventId)
  const presencesQuery = useEventPresences(eventId, page, canViewPresences)

  if (eventQuery.isLoading) return <LoadingState title="Carregando evento..." />
  if (eventQuery.isError) return isForbiddenError(eventQuery.error) ? <ForbiddenState description="Este evento exige uma permissão de público que sua conta não possui." /> : <ErrorState onRetry={() => void eventQuery.refetch()} />
  if (!eventQuery.data) return <EmptyState title="Evento não encontrado." />
  const event = eventQuery.data
  const presenceItems = presencesQuery.data?.items ?? []

  return (
    <div className="space-y-6 py-2 sm:py-4">
      <Button asChild size="sm" variant="ghost"><Link to="/manage/events"><ArrowLeft className="h-4 w-4" />Voltar para eventos</Link></Button>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-medium text-primary">Evento</p><h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{event.title ?? 'Evento sem título'}</h1><p className="mt-1 text-sm text-muted-foreground">{event.description || 'Sem descrição.'}</p></div>{event.status && <Badge variant={event.status === 'CANCELLED' ? 'destructive' : 'secondary'}>{event.status}</Badge>}</div>
      <Card><CardHeader><CardTitle>Informações</CardTitle></CardHeader><CardContent><dl className="grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-3"><div><dt className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" />Início</dt><dd className="mt-1 font-medium">{formatDateTime(event.beginDate)}</dd></div><div><dt className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" />Término</dt><dd className="mt-1 font-medium">{formatDateTime(event.endDate)}</dd></div><div><dt className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />Local</dt><dd className="mt-1 font-medium">{event.location?.name ?? 'Não informado'}</dd></div><div><dt className="text-muted-foreground">Tipo</dt><dd className="mt-1 font-medium">{event.type}</dd></div><div><dt className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-4 w-4" />Público</dt><dd className="mt-1 font-medium">{event.requiredPermission?.label ?? 'Público'}</dd></div><div><dt className="text-muted-foreground">Identificador</dt><dd className="mt-1 break-all font-medium">{event.id}</dd></div></dl></CardContent></Card>
      <section className="space-y-4"><div><h2 className="font-heading text-xl font-bold">Presenças</h2><p className="text-sm text-muted-foreground">Pessoas com presença registrada neste evento.</p></div>
        {!canViewPresences && <ForbiddenState description="A lista exige a permissão EVENT_GET_PRESENCES." />}
        {presencesQuery.isLoading && <LoadingState title="Carregando presenças..." />}
        {presencesQuery.isError && (isForbiddenError(presencesQuery.error) ? <ForbiddenState /> : <ErrorState onRetry={() => void presencesQuery.refetch()} />)}
        {canViewPresences && !presencesQuery.isLoading && !presencesQuery.isError && presenceItems.length === 0 && <EmptyState title="Nenhuma presença registrada." />}
        {presenceItems.length > 0 && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{presenceItems.map((presence, index) => <Card className="gap-3 py-4" key={presence.id ?? index}><CardContent className="space-y-2"><div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-primary" /><h3 className="font-semibold">{[presence.member?.firstName, presence.member?.surname].filter(Boolean).join(' ') || 'Membro'}</h3></div><p className="text-sm text-muted-foreground">{presence.member?.account?.email}</p>{presence.observations && <p className="text-sm">{presence.observations}</p>}{presence.member?.id && <Button asChild size="sm" variant="link"><Link params={{ memberId: presence.member.id }} to="/manage/members/$memberId">Ver membro</Link></Button>}</CardContent></Card>)}</div>}
        {presencesQuery.data && <Pagination disabled={presencesQuery.isFetching} itemLabel="presenças" onPageChange={setPage} page={presencesQuery.data.page ?? page} totalElements={presencesQuery.data.totalElements ?? presenceItems.length} totalPages={presencesQuery.data.totalPages ?? 0} />}
      </section>
    </div>
  )
}
