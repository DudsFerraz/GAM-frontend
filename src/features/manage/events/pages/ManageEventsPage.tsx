import { useNavigate } from '@tanstack/react-router'
import { CalendarDays, MapPin, Plus, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { EmptyState, ErrorState, ForbiddenState, LoadingState } from '@/components/AsyncState'
import { Pagination } from '@/components/Pagination'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { useAccountInfo, useAccountPermissionRecords, useAccountPermissions } from '@/features/account'
import { formatDateTime } from '@/lib/format'
import { isForbiddenError } from '@/lib/http'

import type { EventFilters, EventStatus, EventType } from '../api/events'
import { CreateEventDialog } from '../components/CreateEventDialog'
import { useEvents } from '../hooks/useEvents'

const statusLabels: Record<EventStatus, string> = { SCHEDULED: 'Agendado', COMPLETED: 'Concluído', LOCKED: 'Bloqueado', FINALIZED: 'Finalizado', CANCELLED: 'Cancelado' }
const initialFilters: EventFilters = { title: '', status: 'ALL', type: 'ALL' }

export function ManageEventsPage() {
  const [title, setTitle] = useState('')
  const [filters, setFilters] = useState<EventFilters>(initialFilters)
  const [page, setPage] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const navigate = useNavigate()
  const { account } = useAccountInfo()
  const { permissions } = useAccountPermissions(account)
  const canCreate = permissions.includes('EVENT_CREATE')
  const { permissionRecords } = useAccountPermissionRecords(account, canCreate)
  const query = useEvents(filters, page)
  const items = query.data?.items ?? []
  const audiencePermissions = permissionRecords.filter((permission) => permission.code === 'EVENT_GET_MEMBER' || permission.code === 'EVENT_GET_COORD')

  const submitSearch = (event: FormEvent) => { event.preventDefault(); setPage(0); setFilters((current) => ({ ...current, title })) }

  return (
    <div className="space-y-6 py-2 sm:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-primary">Programação</p><h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Eventos e presenças</h1><p className="mt-1 text-sm text-muted-foreground">Busque eventos, consulte detalhes e acompanhe a lista de presenças.</p></div>{canCreate && <Button onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4" />Novo evento</Button>}</div>

      <form className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_180px_180px_auto] md:items-end" onSubmit={submitSearch}>
        <div><Label htmlFor="event-title">Título</Label><Input id="event-title" onChange={(event) => setTitle(event.target.value)} placeholder="Buscar por título" value={title} /></div>
        <div><Label htmlFor="event-status">Status</Label><Select id="event-status" onChange={(event) => { setPage(0); setFilters((current) => ({ ...current, status: event.target.value as EventStatus | 'ALL' })) }} value={filters.status}><option value="ALL">Todos</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></div>
        <div><Label htmlFor="event-type">Tipo</Label><Select id="event-type" onChange={(event) => { setPage(0); setFilters((current) => ({ ...current, type: event.target.value as EventType | 'ALL' })) }} value={filters.type}><option value="ALL">Todos</option><option value="GENERIC">Genérico</option><option value="ORATORIO">Oratório</option><option value="MISSA">Missa</option></Select></div>
        <Button type="submit"><Search className="h-4 w-4" />Buscar</Button>
      </form>

      {query.isLoading && <LoadingState title="Carregando eventos..." />}
      {query.isError && (isForbiddenError(query.error) ? <ForbiddenState description="A busca de eventos exige a permissão EVENT_SEARCH." /> : <ErrorState onRetry={() => void query.refetch()} />)}
      {!query.isLoading && !query.isError && items.length === 0 && <EmptyState title="Nenhum evento encontrado." />}
      {items.length > 0 && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item, index) => <Card className="gap-4 py-5" key={item.id ?? index}><CardHeader className="flex grid-cols-none flex-row items-start justify-between gap-3 px-5"><div className="min-w-0"><CardTitle className="truncate">{item.title ?? 'Evento sem título'}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{item.type}</p></div>{item.status && <Badge variant={item.status === 'CANCELLED' ? 'destructive' : 'secondary'}>{statusLabels[item.status]}</Badge>}</CardHeader><CardContent className="space-y-2 px-5 text-sm"><p className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" />{formatDateTime(item.beginDate)}</p><p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{item.location?.name ?? 'Local não informado'}</p><p className="line-clamp-2">{item.description || 'Sem descrição.'}</p></CardContent><CardFooter className="px-5"><Button className="w-full" disabled={!item.id} onClick={() => item.id && void navigate({ to: '/manage/events/$eventId', params: { eventId: item.id } })} size="sm" variant="outline">Ver evento</Button></CardFooter></Card>)}</div>}
      {query.data && <Pagination disabled={query.isFetching} itemLabel="eventos" onPageChange={setPage} page={query.data.page ?? page} totalElements={query.data.totalElements ?? items.length} totalPages={query.data.totalPages ?? 0} />}
      <CreateEventDialog audiencePermissions={audiencePermissions} onCreated={(eventId) => { setIsCreateOpen(false); void navigate({ to: '/manage/events/$eventId', params: { eventId } }) }} onOpenChange={setIsCreateOpen} open={isCreateOpen} />
    </div>
  )
}
