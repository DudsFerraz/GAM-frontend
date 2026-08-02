import { Link, Navigate, useNavigate } from '@tanstack/react-router'
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
} from 'lucide-react'
import { useState } from 'react'

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/AsyncState'
import { Pagination } from '@/components/Pagination'
import {
  SearchAndFilter,
  type SearchFilter,
  type SortCriteria,
} from '@/components/SearchAndFilter'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import {
  useAccountInfo,
  useAccountPermissions,
} from '@/features/account'
import {
  getEventStatusLabel,
} from '@/features/manage/events'
import { isForbiddenError } from '@/lib/http'
import { useCapabilityBoundState } from '@/hooks/useCapabilityBoundState'

import { CreateOratorioDialog } from '../components/CreateOratorioDialog'
import {
  ORATORIO_SEARCH_CONFIG,
} from '../../events/eventSearchConfig'
import { formatOratorioDate } from '../presentation'
import { toOratorioSearch } from '../oratorioSearch'
import { useOratorioSearch } from '../hooks/useOratorioSearch'

export function ManageOratoriosPage() {
  const [search, setSearch] = useState(() =>
    toOratorioSearch([], []),
  )
  const [page, setPage] = useState(0)
  const navigate = useNavigate()
  const { account } = useAccountInfo()
  const { permissions } = useAccountPermissions(account)
  const canView = permissions.includes('ORATORIO_GET')
  const canSearch = permissions.includes('EVENT_SEARCH')
  const canViewOratorianos = permissions.includes('ORATORIANO_GET')
  const canCreate = permissions.includes('ORATORIO_CREATE')
  const canOpenCreate = canView && canCreate
  const [isCreateOpen, setIsCreateOpen] = useCapabilityBoundState(
    canOpenCreate,
    false,
  )
  const query = useOratorioSearch(search, page, canView && canSearch)
  const items = query.data?.items ?? []

  const handleSearch = (filters: SearchFilter[], sorts: SortCriteria[]) => {
    setPage(0)
    setSearch(toOratorioSearch(filters, sorts))
  }

  if (!canView && canViewOratorianos) {
    return (
      <Navigate
        replace
        to="/manage/oratorios/oratorianos"
      />
    )
  }

  if (!canView) {
    return (
      <ForbiddenState description="Sua conta não tem acesso às ocorrências de Oratório." />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            Operação do Oratório
          </p>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Ocorrências
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize o planejamento, as equipes e as presenças de cada data.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            Novo Oratório
          </Button>
        )}
      </div>

      {!canSearch ? (
        <ForbiddenState
          description="Sua conta pode consultar um Oratório conhecido, mas não possui acesso à busca de ocorrências."
          title="A lista de ocorrências não está disponível."
        />
      ) : (
        <>
          <div className="rounded-xl border bg-card p-4">
            <SearchAndFilter
              config={ORATORIO_SEARCH_CONFIG}
              mainFilterField="beginDate"
              onSearch={handleSearch}
            />
          </div>

          {query.isLoading && (
            <LoadingState title="Carregando Oratórios..." />
          )}
          {query.isError && (
            isForbiddenError(query.error) ? (
              <ForbiddenState description="Sua conta não tem acesso à busca de Oratórios." />
            ) : (
              <ErrorState onRetry={() => void query.refetch()} />
            )
          )}
          {!query.isLoading && !query.isError && items.length === 0 && (
            <EmptyState
              description="Crie uma ocorrência ou escolha outra situação."
              title="Nenhum Oratório encontrado."
            />
          )}
          {!query.isError && items.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item, index) => (
                <Card
                  className="gap-4 overflow-hidden py-0"
                  interactive={Boolean(item.id)}
                  key={item.id ?? index}
                >
                  {item.id && (
                    <CardActionArea asChild>
                      <Link
                        aria-label={`Abrir Oratório de ${formatOratorioDate(item.beginDate)}`}
                        params={{ oratorioId: item.id }}
                        to="/manage/oratorios/$oratorioId"
                      />
                    </CardActionArea>
                  )}
                  <div className="h-1.5 bg-primary" />
                  <CardHeader className="pointer-events-none relative z-[1] flex grid-cols-none flex-row items-start justify-between gap-3 px-5 pt-1">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        Oratório
                      </p>
                      <CardTitle className="mt-2 font-heading text-xl">
                        {formatOratorioDate(item.beginDate)}
                      </CardTitle>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        variant={
                          item.status === 'CANCELLED'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {getEventStatusLabel(item.status)}
                      </Badge>
                      <ChevronRight
                        aria-hidden="true"
                        className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pointer-events-none relative z-[1] space-y-3 px-5 pb-5 text-sm">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Clock3 aria-hidden="true" className="h-4 w-4" />
                      14h às 17h
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <MapPin aria-hidden="true" className="h-4 w-4" />
                      {item.gamLocation?.name ?? 'Local não informado'}
                    </p>
                    <p className="flex items-center gap-2 font-medium text-primary">
                      <CalendarDays
                        aria-hidden="true"
                        className="h-4 w-4"
                      />
                      Abrir planejamento e equipes
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!query.isError && query.data && (
            <Pagination
              disabled={query.isFetching}
              itemLabel="Oratórios"
              onPageChange={setPage}
              page={query.data.page ?? page}
              totalElements={query.data.totalElements ?? items.length}
              totalPages={query.data.totalPages ?? 0}
            />
          )}
        </>
      )}

      <CreateOratorioDialog
        onCreated={(oratorioId) => {
          setIsCreateOpen(false)
          void navigate({
            params: { oratorioId },
            to: '/manage/oratorios/$oratorioId',
          })
        }}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
    </div>
  )
}
