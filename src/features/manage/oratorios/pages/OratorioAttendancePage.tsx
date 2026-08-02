import { Link } from '@tanstack/react-router'
import { ArrowLeft, CalendarCheck2, UsersRound } from 'lucide-react'
import { useState } from 'react'

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/AsyncState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  useAccountInfo,
  useAccountPermissions,
} from '@/features/account'
import { getEventStatusLabel } from '@/features/manage/events'
import { getErrorMessage, isForbiddenError } from '@/lib/http'
import { cn } from '@/lib/utils'
import { useCapabilityBoundState } from '@/hooks/useCapabilityBoundState'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

import type {
  AttendanceKind,
  AttendanceRosterEntry,
} from '../api/oratorios'
import {
  getEffectiveOratorioStatus,
  getOratorioAttendanceAvailability,
} from '../attendanceRules'
import { AttendanceRemovalDialog } from '../components/AttendanceRemovalDialog'
import { AttendanceRoster } from '../components/AttendanceRoster'
import { PresentSummary } from '../components/PresentSummary'
import { QuickOratorianoRegistration } from '../components/QuickOratorianoRegistration'
import {
  useAttendanceRoster,
  useMarkAttendance,
  useOratorio,
  usePresentSummary,
  useUncheckAttendance,
} from '../hooks/useOratorios'
import { useOratorioClock } from '../hooks/useOratorioClock'
import {
  formatOratorioDate,
  getAttendancePersonName,
} from '../presentation'

type RemovalTarget = {
  kind: AttendanceKind
  name: string
  personId: string
}

export function OratorioAttendancePage({
  oratorioId,
}: {
  oratorioId: string
}) {
  const [activeTab, setActiveTab] =
    useState<AttendanceKind>('members')
  const [memberNameInput, setMemberNameInput] = useState('')
  const [memberPage, setMemberPage] = useState(0)
  const [oratorianoNameInput, setOratorianoNameInput] = useState('')
  const [oratorianoPage, setOratorianoPage] = useState(0)
  const [pendingKeys, setPendingKeys] =
    useState<ReadonlySet<string>>(new Set())
  const [mutationError, setMutationError] = useState<unknown>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const now = useOratorioClock()
  const { account } = useAccountInfo()
  const { permissions } = useAccountPermissions(account)
  const canRead = permissions.includes('ORATORIO_ATTENDANCE_GET')
  const canManage = permissions.includes('ORATORIO_ATTENDANCE_MANAGE')
  const canViewOratorio = permissions.includes('ORATORIO_GET')
  const canRegisterOratoriano = permissions.includes('ORATORIANO_REGISTER')
  const normalizedMemberNameInput = memberNameInput.trim()
  const memberName = useDebouncedValue(normalizedMemberNameInput)
  const normalizedOratorianoNameInput = oratorianoNameInput.trim()
  const oratorianoName = useDebouncedValue(normalizedOratorianoNameInput)
  const isMemberSearchSettled = normalizedMemberNameInput === memberName
  const isOratorianoSearchSettled =
    normalizedOratorianoNameInput === oratorianoName
  const memberQueryPage = isMemberSearchSettled
    ? memberPage
    : 0
  const oratorianoQueryPage = isOratorianoSearchSettled
    ? oratorianoPage
    : 0

  const oratorioQuery = useOratorio(
    oratorioId,
    canRead && canViewOratorio,
  )
  const membersQuery = useAttendanceRoster(
    oratorioId,
    'members',
    memberQueryPage,
    memberName,
    canRead && isMemberSearchSettled,
  )
  const oratorianosQuery = useAttendanceRoster(
    oratorioId,
    'oratorianos',
    oratorianoQueryPage,
    oratorianoName,
    canRead && isOratorianoSearchSettled,
  )
  const summaryQuery = usePresentSummary(oratorioId, canRead)
  const markMutation = useMarkAttendance()
  const uncheckMutation = useUncheckAttendance()
  const event = oratorioQuery.data?.event
  const effectiveStatus = getEffectiveOratorioStatus(event, now)
  const availability = getOratorioAttendanceAvailability(event, now)
  const canRemoveAttendance = canRead
    && canViewOratorio
    && canManage
    && availability.canUncheck
  const [removalTarget, setRemovalTarget] =
    useCapabilityBoundState<RemovalTarget | null>(
      canRemoveAttendance,
      null,
    )

  if (!canRead) {
    return (
      <ForbiddenState description="Sua conta não tem acesso ao controle de presença do Oratório." />
    )
  }

  if (!canViewOratorio) {
    return (
      <ForbiddenState description="Sua conta não tem acesso aos dados da ocorrência necessários para operar as presenças." />
    )
  }

  if (oratorioQuery.isLoading) {
    return <LoadingState title="Preparando o controle de presença..." />
  }

  if (oratorioQuery.isError) {
    return isForbiddenError(oratorioQuery.error) ? (
      <ForbiddenState description="Sua conta não pode consultar esta ocorrência de Oratório." />
    ) : (
      <ErrorState onRetry={() => void oratorioQuery.refetch()} />
    )
  }

  if (!oratorioQuery.data) {
    return <EmptyState title="Oratório não encontrado." />
  }

  const updatePending = (key: string, pending: boolean) => {
    setPendingKeys((current) => {
      const next = new Set(current)
      if (pending) next.add(key)
      else next.delete(key)
      return next
    })
  }

  const persistToggle = async (
    kind: AttendanceKind,
    personId: string,
    name: string,
    checked: boolean,
    reason?: string,
  ): Promise<boolean> => {
    const canPersist = canRead
      && canViewOratorio
      && canManage
      && (checked ? availability.canMark : availability.canUncheck)
    if (!canPersist) return false

    const key = `${kind}:${personId}`
    updatePending(key, true)
    setMutationError(null)
    setFeedback(null)

    try {
      if (checked) {
        await markMutation.mutateAsync({ kind, oratorioId, personId })
        setFeedback(`Presença de ${name} marcada.`)
      } else {
        await uncheckMutation.mutateAsync({
          kind,
          oratorioId,
          personId,
          reason,
        })
        setFeedback(`Presença de ${name} removida.`)
      }
      return true
    } catch (error: unknown) {
      setMutationError(error)
      return false
    } finally {
      updatePending(key, false)
    }
  }

  const toggleEntry = (
    kind: AttendanceKind,
    entry: AttendanceRosterEntry,
    checked: boolean,
  ) => {
    const personId = entry.person?.id
    if (!personId) return

    const name = getAttendancePersonName(entry.person)
    if (!checked && availability.removalReasonRequired) {
      setMutationError(null)
      setRemovalTarget({ kind, name, personId })
      return
    }

    void persistToggle(kind, personId, name, checked)
  }

  const markExistingOratoriano = async (
    entry: AttendanceRosterEntry,
  ): Promise<boolean> => {
    const personId = entry.person?.id
    if (!personId || !availability.canMark || !canManage) return false

    return persistToggle(
      'oratorianos',
      personId,
      getAttendancePersonName(entry.person),
      true,
    )
  }

  const tabClassName = (tab: AttendanceKind) => cn(
    'min-h-11 flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    activeTab === tab
      ? 'bg-background text-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
  )

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const nextTab = activeTab === 'members'
      ? 'oratorianos'
      : 'members'
    setActiveTab(nextTab)
    document.getElementById(`attendance-tab-${nextTab}`)?.focus()
  }

  return (
    <div className="space-y-6 pb-24 xl:pb-4">
      <Button asChild size="sm" variant="ghost">
        <Link
          params={{ oratorioId }}
          to="/manage/oratorios/$oratorioId"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar para o Oratório
        </Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            Operação do dia
          </p>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Controle de presença
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Oratório de {formatOratorioDate(event?.beginDate)}
          </p>
        </div>
        <Badge
          variant={
            effectiveStatus === 'CANCELLED'
              ? 'destructive'
              : 'secondary'
          }
        >
          {getEventStatusLabel(effectiveStatus)}
        </Badge>
      </div>

      {availability.message && (
        <Alert>
          <CalendarCheck2 aria-hidden="true" className="h-4 w-4" />
          <AlertTitle>Alterações de presença limitadas.</AlertTitle>
          <AlertDescription>{availability.message}</AlertDescription>
        </Alert>
      )}

      {mutationError !== null && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível atualizar a presença.</AlertTitle>
          <AlertDescription>
            {getErrorMessage(mutationError)}
          </AlertDescription>
        </Alert>
      )}
      {feedback && (
        <p
          aria-live="polite"
          className="text-sm font-medium text-primary"
        >
          {feedback}
        </p>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <div
            aria-label="Tipo de participante"
            className="flex gap-1 rounded-xl border bg-muted/40 p-1"
            role="tablist"
          >
            <button
              aria-controls="attendance-panel-members"
              aria-selected={activeTab === 'members'}
              className={tabClassName('members')}
              id="attendance-tab-members"
              onClick={() => setActiveTab('members')}
              onKeyDown={handleTabKeyDown}
              role="tab"
              tabIndex={activeTab === 'members' ? 0 : -1}
              type="button"
            >
              Membros
            </button>
            <button
              aria-controls="attendance-panel-oratorianos"
              aria-selected={activeTab === 'oratorianos'}
              className={tabClassName('oratorianos')}
              id="attendance-tab-oratorianos"
              onClick={() => setActiveTab('oratorianos')}
              onKeyDown={handleTabKeyDown}
              role="tab"
              tabIndex={activeTab === 'oratorianos' ? 0 : -1}
              type="button"
            >
              Oratorianos
            </button>
          </div>

          <section
            aria-labelledby="attendance-tab-members"
            hidden={activeTab !== 'members'}
            id="attendance-panel-members"
            role="tabpanel"
          >
            <AttendanceRoster
              availability={availability}
              canManage={canManage}
              error={membersQuery.error}
              isError={membersQuery.isError}
              isFetching={membersQuery.isFetching}
              isLoading={membersQuery.isLoading}
              kind="members"
              nameInput={memberNameInput}
              onNameInputChange={(name) => {
                setMemberNameInput(name)
                setMemberPage(0)
              }}
              onPageChange={setMemberPage}
              onRetry={() => void membersQuery.refetch()}
              onToggle={toggleEntry}
              page={memberQueryPage}
              pendingKeys={pendingKeys}
              roster={membersQuery.data}
            />
          </section>

          <section
            aria-labelledby="attendance-tab-oratorianos"
            hidden={activeTab !== 'oratorianos'}
            id="attendance-panel-oratorianos"
            role="tabpanel"
          >
            <div className="space-y-5">
              <QuickOratorianoRegistration
                enabled={
                  canManage
                  && canRegisterOratoriano
                  && availability.canMark
                }
                onMarkExisting={markExistingOratoriano}
                oratorioId={oratorioId}
              />
              <AttendanceRoster
                availability={availability}
                canManage={canManage}
                error={oratorianosQuery.error}
                isError={oratorianosQuery.isError}
                isFetching={oratorianosQuery.isFetching}
                isLoading={oratorianosQuery.isLoading}
                kind="oratorianos"
                nameInput={oratorianoNameInput}
                onNameInputChange={(name) => {
                  setOratorianoNameInput(name)
                  setOratorianoPage(0)
                }}
                onPageChange={setOratorianoPage}
                onRetry={() => void oratorianosQuery.refetch()}
                onToggle={toggleEntry}
                page={oratorianoQueryPage}
                pendingKeys={pendingKeys}
                roster={oratorianosQuery.data}
              />
            </div>
          </section>

          {!canManage && (
            <Alert>
              <UsersRound aria-hidden="true" className="h-4 w-4" />
              <AlertTitle>Controle em modo de leitura.</AlertTitle>
              <AlertDescription>
                Sua conta pode consultar as presenças, mas não alterá-las.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <PresentSummary
          isError={summaryQuery.isError}
          isLoading={summaryQuery.isLoading}
          onRetry={() => void summaryQuery.refetch()}
          summary={summaryQuery.data}
        />
      </div>

      {removalTarget && canRemoveAttendance && (
        <AttendanceRemovalDialog
          errorMessage={
            mutationError ? getErrorMessage(mutationError) : null
          }
          isPending={pendingKeys.has(
            `${removalTarget.kind}:${removalTarget.personId}`,
          )}
          name={removalTarget.name}
          onConfirm={(reason) =>
            persistToggle(
              removalTarget.kind,
              removalTarget.personId,
              removalTarget.name,
              false,
              reason,
            )
          }
          onOpenChange={(open) => {
            if (!open) {
              setRemovalTarget(null)
              setMutationError(null)
            }
          }}
          open
        />
      )}
    </div>
  )
}
