import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  CalendarCheck2,
  CalendarDays,
  Clock3,
  MapPin,
  UsersRound,
} from 'lucide-react'

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/AsyncState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  useAccountInfo,
  useAccountPermissions,
} from '@/features/account'
import { getEventStatusLabel } from '@/features/manage/events'
import { isForbiddenError } from '@/lib/http'

import { OratorioLifecycleActions } from '../components/OratorioLifecycleActions'
import { OratorioPlanningForm } from '../components/OratorioPlanningForm'
import { OratorioSchedule } from '../components/OratorioSchedule'
import { OratorioTeamsSection } from '../components/OratorioTeamsSection'
import { getEffectiveOratorioStatus } from '../attendanceRules'
import { useOratorioClock } from '../hooks/useOratorioClock'
import { useOratorio } from '../hooks/useOratorios'
import { canEditOratorioPlanning } from '../oratorioManagement'
import { formatOratorioDate } from '../presentation'

export function OratorioDetailPage({
  oratorioId,
}: {
  oratorioId: string
}) {
  const navigate = useNavigate()
  const now = useOratorioClock()
  const { account } = useAccountInfo()
  const { permissions } = useAccountPermissions(account)
  const canView = permissions.includes('ORATORIO_GET')
  const canManage = permissions.includes('ORATORIO_MANAGE')
  const canReadAttendance = permissions.includes(
    'ORATORIO_ATTENDANCE_GET',
  )
  const query = useOratorio(oratorioId, canView)

  if (!canView) {
    return (
      <ForbiddenState description="Sua conta não tem acesso aos detalhes do Oratório." />
    )
  }

  if (query.isLoading) {
    return <LoadingState title="Carregando Oratório..." />
  }

  if (query.isError) {
    return isForbiddenError(query.error) ? (
      <ForbiddenState description="Sua conta não pode consultar esta ocorrência de Oratório." />
    ) : (
      <ErrorState onRetry={() => void query.refetch()} />
    )
  }

  if (!query.data) {
    return <EmptyState title="Oratório não encontrado." />
  }

  const oratorio = query.data
  const event = oratorio.event

  if (!event) {
    return (
      <ErrorState
        description="Atualize a página. Se o problema continuar, procure a coordenação."
        onRetry={() => void query.refetch()}
        title="Os dados desta ocorrência estão incompletos."
      />
    )
  }

  const effectiveStatus = getEffectiveOratorioStatus(event, now)
  const planningEditable = canManage
    && canEditOratorioPlanning(effectiveStatus)

  return (
    <div className="space-y-6">
      <Button asChild size="sm" variant="ghost">
        <Link to="/manage/oratorios">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar para ocorrências
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            Ocorrência de Oratório
          </p>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {formatOratorioDate(event.beginDate)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Planejamento, responsáveis e operação desta data.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={
              effectiveStatus === 'CANCELLED'
                ? 'destructive'
                : 'secondary'
            }
          >
            {getEventStatusLabel(effectiveStatus)}
          </Badge>
          {canReadAttendance && (
            <Button asChild>
              <Link
                params={{ oratorioId }}
                to="/manage/oratorios/$oratorioId/attendance"
              >
                <CalendarCheck2
                  aria-hidden="true"
                  className="h-4 w-4"
                />
                Controle de presença
              </Link>
            </Button>
          )}
        </div>
      </div>

      {effectiveStatus === 'CANCELLED' && (
        <Alert variant="destructive">
          <AlertTitle>Este Oratório foi cancelado.</AlertTitle>
          <AlertDescription>
            {event.cancellationReason
              ? `Motivo: ${event.cancellationReason}`
              : 'O motivo do cancelamento não foi informado.'}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações do dia</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
                Data
              </dt>
              <dd className="mt-1 font-medium">
                {formatOratorioDate(event.beginDate)}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Clock3 aria-hidden="true" className="h-4 w-4" />
                Horário
              </dt>
              <dd className="mt-1 font-medium">14h às 17h</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <MapPin aria-hidden="true" className="h-4 w-4" />
                Local
              </dt>
              <dd className="mt-1 font-medium">
                {event.gamLocation?.name ?? 'Local não informado'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <OratorioSchedule schedule={oratorio.schedule} />
        <OratorioPlanningForm
          canEdit={planningEditable}
          oratorioId={oratorioId}
          planning={oratorio.planning}
        />
      </div>

      <OratorioTeamsSection
        canManage={planningEditable}
        canReadRoster={canReadAttendance}
        oratorioId={oratorioId}
        teams={oratorio.teams}
      />

      {canManage && (
        <OratorioLifecycleActions
          onRemoved={() => {
            void navigate({ to: '/manage/oratorios' })
          }}
          oratorioId={oratorioId}
          status={effectiveStatus}
        />
      )}

      {!canReadAttendance && (
        <Card>
          <CardContent className="flex items-start gap-3 text-sm">
            <UsersRound
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
            />
            <p className="text-muted-foreground">
              O controle de presença não está disponível para sua conta.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
