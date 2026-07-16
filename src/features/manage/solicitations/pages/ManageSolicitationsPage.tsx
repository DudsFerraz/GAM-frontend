import { FileClock, Plus, UserRound } from 'lucide-react'
import { useState } from 'react'

import { EmptyState, ErrorState, ForbiddenState, LoadingState } from '@/components/AsyncState'
import { Pagination } from '@/components/Pagination'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { useAccountInfo, useAccountPermissions } from '@/features/account'
import { formatDateTime } from '@/lib/format'
import { isForbiddenError } from '@/lib/http'

import type { SolicitationStatus } from '../api/solicitations'
import { SolicitationDetailsDialog } from '../components/SolicitationDetailsDialog'
import { SubmitSolicitationDialog } from '../components/SubmitSolicitationDialog'
import { useSolicitations } from '../hooks/useSolicitations'

const statusLabels = { PENDING: 'Pendente', APPROVED: 'Aprovada', REJECTED: 'Rejeitada' } as const

export function ManageSolicitationsPage() {
  const [status, setStatus] = useState<SolicitationStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const { account } = useAccountInfo()
  const { permissions } = useAccountPermissions(account)
  const canReview = permissions.includes('MEMBER_MANAGE')
  const query = useSolicitations(status, page)
  const items = query.data?.items ?? []

  return (
    <div className="space-y-6 py-2 sm:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Membresia</p>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Solicitações</h1>
          <p className="mt-1 text-sm text-muted-foreground">Consulte seu histórico ou analise solicitações quando autorizado.</p>
        </div>
        <Button onClick={() => setIsSubmitOpen(true)}><Plus className="h-4 w-4" />Nova solicitação</Button>
      </div>

      <div className="max-w-xs rounded-xl border bg-card p-4">
        <Label htmlFor="solicitation-status">Status</Label>
        <Select id="solicitation-status" value={status} onChange={(event) => { setStatus(event.target.value as SolicitationStatus | 'ALL'); setPage(0) }}>
          <option value="ALL">Todos</option><option value="PENDING">Pendentes</option><option value="APPROVED">Aprovadas</option><option value="REJECTED">Rejeitadas</option>
        </Select>
      </div>

      {query.isLoading && <LoadingState title="Carregando solicitações..." />}
      {query.isError && (isForbiddenError(query.error) ? <ForbiddenState /> : <ErrorState onRetry={() => void query.refetch()} />)}
      {!query.isLoading && !query.isError && items.length === 0 && <EmptyState title="Nenhuma solicitação encontrada." description="Uma nova solicitação aparecerá aqui depois do envio." />}
      {items.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <Card key={item.id ?? index} className="gap-4 py-5">
              <CardHeader className="flex grid-cols-none flex-row items-start justify-between gap-3 px-5">
                <div><CardTitle>{[item.firstName, item.surname].filter(Boolean).join(' ') || 'Solicitação'}</CardTitle><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><UserRound className="h-3.5 w-3.5" />{item.account?.displayName ?? 'Conta não informada'}</p></div>
                {item.status && <Badge variant={item.status === 'REJECTED' ? 'destructive' : 'secondary'}>{statusLabels[item.status]}</Badge>}
              </CardHeader>
              <CardContent className="space-y-2 px-5 text-sm"><p className="flex items-center gap-2 text-muted-foreground"><FileClock className="h-4 w-4" />{formatDateTime(item.submittedAt)}</p><p className="line-clamp-2">{item.justification}</p></CardContent>
              <CardFooter className="px-5"><Button className="w-full" disabled={!item.id} onClick={() => item.id && setSelectedId(item.id)} size="sm" variant="outline">Ver detalhes</Button></CardFooter>
            </Card>
          ))}
        </div>
      )}
      {query.data && <Pagination disabled={query.isFetching} itemLabel="solicitações" onPageChange={setPage} page={query.data.page ?? page} totalElements={query.data.totalElements ?? items.length} totalPages={query.data.totalPages ?? 0} />}

      <SubmitSolicitationDialog onOpenChange={setIsSubmitOpen} open={isSubmitOpen} />
      <SolicitationDetailsDialog canReview={canReview} id={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}
