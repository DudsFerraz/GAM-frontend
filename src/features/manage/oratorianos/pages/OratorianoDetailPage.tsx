import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  History,
  Pencil,
  Phone,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/AsyncState'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import {
  useAccountInfo,
  useAccountPermissions,
} from '@/features/account'
import { getEventStatusLabel } from '@/features/manage/events'
import { OratorianoFormsSection } from '@/features/manage/oratorianoForms'
import { formatDate } from '@/lib/format'
import { isForbiddenError } from '@/lib/http'
import { useCapabilityBoundState } from '@/hooks/useCapabilityBoundState'

import { EditOratorianoDialog } from '../components/EditOratorianoDialog'
import { DeleteOratorianoDialog } from '../components/DeleteOratorianoDialog'
import { OratorianoProfileNotice } from '../components/OratorianoProfileNotice'
import {
  useOratoriano,
  useOratorianoAttendances,
  useOratorianoAttendanceSummary,
} from '../hooks/useOratorianos'
import {
  getAttendanceCount,
  getOratorianoFullName,
} from '../presentation'
import { oratorianoQueryKeys } from '../queryKeys'
import type { OratorianoProfileNotice as OratorianoProfileNoticeValue } from '../profileNotices'

const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const

function getSaoPauloYearAndMonth(): { month: number; year: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
  }).formatToParts(new Date())
  const getPart = (type: 'month' | 'year') =>
    Number(parts.find((part) => part.type === type)?.value)

  return {
    month: getPart('month'),
    year: getPart('year'),
  }
}

export function OratorianoDetailPage({
  initialNotice,
  oratorianoId,
  onNoticeDismiss,
}: {
  initialNotice?: OratorianoProfileNoticeValue
  oratorianoId: string
  onNoticeDismiss?: () => void
}) {
  const currentPeriod = getSaoPauloYearAndMonth()
  const [year, setYear] = useState(currentPeriod.year)
  const [month, setMonth] = useState(currentPeriod.month)
  const [historyPage, setHistoryPage] = useState(0)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { account } = useAccountInfo()
  const { permissions } = useAccountPermissions(account)
  const canView = permissions.includes('ORATORIANO_GET')
  const canManage = permissions.includes('ORATORIANO_MANAGE')
  const canEditProfile = canView && canManage
  const [isEditOpen, setIsEditOpen] = useCapabilityBoundState(
    canEditProfile,
    false,
  )
  const [isDeleteOpen, setIsDeleteOpen] = useCapabilityBoundState(
    canEditProfile,
    false,
  )
  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false)
  const canViewOratorios = permissions.includes('ORATORIO_GET')
  const canViewForms = permissions.includes('ORATORIANO_FORM_GET')
  const canManageForms = canViewForms
    && permissions.includes('ORATORIANO_FORM_MANAGE')
  const profileQuery = useOratoriano(oratorianoId, canView)
  const historyQuery = useOratorianoAttendances(
    oratorianoId,
    historyPage,
    canView,
  )
  const summaryQuery = useOratorianoAttendanceSummary(
    oratorianoId,
    year,
    month,
    canView,
  )

  if (!canView) {
    return (
      <ForbiddenState description="Sua conta não tem acesso ao perfil de Oratorianos." />
    )
  }

  if (profileQuery.isLoading) {
    return <LoadingState title="Carregando Oratoriano..." />
  }

  if (profileQuery.isError) {
    return isForbiddenError(profileQuery.error) ? (
      <ForbiddenState description="Sua conta não pode consultar este Oratoriano." />
    ) : (
      <ErrorState onRetry={() => void profileQuery.refetch()} />
    )
  }

  if (!profileQuery.data) {
    return <EmptyState title="Oratoriano não encontrado." />
  }

  const oratoriano = profileQuery.data
  const fullName = getOratorianoFullName(oratoriano)
  const summary = summaryQuery.data
  const historyItems = historyQuery.data?.items ?? []

  return (
    <div className="space-y-6">
      <Button asChild size="sm" variant="ghost">
        <Link to="/manage/oratorios/oratorianos">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar para Oratorianos
        </Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            Perfil do Oratoriano
          </p>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {fullName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastro comum e histórico de presença.
          </p>
        </div>
        {canManage && (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setIsEditOpen(true)}
              type="button"
              variant="outline"
            >
              <Pencil aria-hidden="true" className="h-4 w-4" />
              Editar perfil
            </Button>
            <Button
              onClick={() => setIsDeleteOpen(true)}
              type="button"
              variant="destructive"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Excluir cadastro
            </Button>
          </div>
        )}
      </div>

      {initialNotice && !isNoticeDismissed && (
        <OratorianoProfileNotice
          notice={initialNotice}
          onDismiss={() => {
            setIsNoticeDismissed(true)
            onNoticeDismiss?.()
          }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dados cadastrais</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <UserRound aria-hidden="true" className="h-4 w-4" />
                Nome completo
              </dt>
              <dd className="mt-1 font-medium">{fullName}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
                Nascimento
              </dt>
              <dd className="mt-1 font-medium">
                {oratoriano.birthDate
                  ? formatDate(oratoriano.birthDate)
                  : 'Não informado'}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Phone aria-hidden="true" className="h-4 w-4" />
                Telefone
              </dt>
              <dd className="mt-1 font-medium">
                {oratoriano.phoneNumber ?? 'Não informado'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <OratorianoFormsSection
        canManage={canManageForms}
        canView={canViewForms}
        oratorianoId={oratorianoId}
      />

      <section aria-labelledby="frequency-title" className="space-y-4">
        <div>
          <h2
            className="font-heading text-xl font-bold"
            id="frequency-title"
          >
            Resumo de frequência
          </h2>
          <p className="text-sm text-muted-foreground">
            Contagens informativas do histórico, sem classificação ou
            pontuação.
          </p>
        </div>
        <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="frequency-year">Ano</Label>
            <Input
              id="frequency-year"
              max={currentPeriod.year + 1}
              min={1900}
              onChange={(event) => {
                const nextYear = Number(event.target.value)
                if (Number.isInteger(nextYear) && nextYear >= 1900) {
                  setYear(nextYear)
                }
              }}
              type="number"
              value={year}
            />
          </div>
          <div>
            <Label htmlFor="frequency-month">Mês</Label>
            <Select
              id="frequency-month"
              onChange={(event) => setMonth(Number(event.target.value))}
              value={month}
            >
              {MONTH_LABELS.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {summaryQuery.isLoading && (
          <LoadingState title="Calculando frequência..." />
        )}
        {summaryQuery.isError && (
          isForbiddenError(summaryQuery.error) ? (
            <ForbiddenState description="Sua conta não pode consultar este resumo." />
          ) : (
            <ErrorState onRetry={() => void summaryQuery.refetch()} />
          )
        )}
        {!summaryQuery.isError && summary && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <FrequencyCard
              label="Presenças no total"
              value={summary.oratorioAttendances}
            />
            <FrequencyCard
              label="Meses distintos com presença"
              value={summary.oratorioDistinctMonthsAttendances}
            />
            <FrequencyCard
              label="Anos distintos com presença"
              value={summary.oratorioDistinctYearsAttendances}
            />
            <FrequencyCard
              label={`Presenças em ${year}`}
              value={summary.oratorioYearAttendances}
            />
            <FrequencyCard
              label={`Meses com presença em ${year}`}
              value={summary.oratorioYearDistinctMonthsAttendances}
            />
            <FrequencyCard
              label={`Presenças em ${MONTH_LABELS[month - 1]} de ${year}`}
              value={summary.oratorioMonthAttendances}
            />
          </div>
        )}
      </section>

      <section aria-labelledby="history-title" className="space-y-4">
        <div>
          <h2
            className="font-heading text-xl font-bold"
            id="history-title"
          >
            Histórico de presenças
          </h2>
          <p className="text-sm text-muted-foreground">
            Ocorrências de Oratório em que a presença está ativa.
          </p>
        </div>

        {historyQuery.isLoading && (
          <LoadingState title="Carregando histórico..." />
        )}
        {historyQuery.isError && (
          isForbiddenError(historyQuery.error) ? (
            <ForbiddenState description="Sua conta não pode consultar este histórico." />
          ) : (
            <ErrorState onRetry={() => void historyQuery.refetch()} />
          )
        )}
        {!historyQuery.isLoading
          && !historyQuery.isError
          && historyItems.length === 0 && (
          <EmptyState
            description="As próximas marcações aparecerão aqui."
            title="Nenhuma presença registrada."
          />
        )}
        {!historyQuery.isError && historyItems.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {historyItems.map((item, index) => {
              const canOpen = canViewOratorios && Boolean(item.oratorioId)
              const content = (
                <CardContent className="pointer-events-none relative z-[1] flex items-center gap-3">
                  <History
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">
                      {formatDate(item.localDate)}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {getEventStatusLabel(item.status)}
                    </span>
                  </span>
                  {canOpen && (
                    <ChevronRight
                      aria-hidden="true"
                      className="h-4 w-4 text-muted-foreground"
                    />
                  )}
                </CardContent>
              )

              return (
                <Card
                  className="gap-0 py-4"
                  interactive={canOpen}
                  key={item.oratorioId ?? `${item.localDate}-${index}`}
                >
                  {canOpen && item.oratorioId && (
                    <CardActionArea asChild>
                      <Link
                        aria-label={`Abrir Oratório de ${formatDate(item.localDate)}`}
                        params={{ oratorioId: item.oratorioId }}
                        to="/manage/oratorios/$oratorioId"
                      />
                    </CardActionArea>
                  )}
                  {content}
                </Card>
              )
            })}
          </div>
        )}
        {!historyQuery.isError && historyQuery.data && (
          <Pagination
            disabled={historyQuery.isFetching}
            itemLabel="presenças"
            onPageChange={setHistoryPage}
            page={historyQuery.data.page ?? historyPage}
            totalElements={
              historyQuery.data.totalElements ?? historyItems.length
            }
            totalPages={historyQuery.data.totalPages ?? 0}
          />
        )}
      </section>

      <EditOratorianoDialog
        onOpenChange={setIsEditOpen}
        open={isEditOpen}
        oratoriano={oratoriano}
        oratorianoId={oratorianoId}
      />
      {canManage && (
        <DeleteOratorianoDialog
          name={fullName}
          onDeleted={() => {
            void navigate({
              replace: true,
              search: { notice: 'oratoriano-excluido' },
              to: '/manage/oratorios/oratorianos',
            }).then(() => {
              queryClient.removeQueries({
                queryKey: oratorianoQueryKeys.detail(oratorianoId),
              })
            })
          }}
          onOpenChange={setIsDeleteOpen}
          open={isDeleteOpen}
          oratorianoId={oratorianoId}
        />
      )}
    </div>
  )
}

function FrequencyCard({
  label,
  value,
}: {
  label: string
  value?: number | null
}) {
  return (
    <Card className="gap-2 py-4">
      <CardContent>
        <p className="font-heading text-3xl font-bold text-primary">
          {getAttendanceCount(value)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
