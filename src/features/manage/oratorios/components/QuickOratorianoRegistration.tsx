import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  areHumanEquivalentNames,
  registerOratorianoSchema,
  type RegisterOratorianoFormValues,
} from '@/features/manage/oratorianos'
import { useCapabilityBoundState } from '@/hooks/useCapabilityBoundState'
import { getErrorMessage } from '@/lib/http'

import type { AttendanceRosterEntry } from '../api/oratorios'
import {
  useAttendanceRoster,
  useExactOratorianoAttendanceMatch,
  useRegisterAndMarkOratoriano,
} from '../hooks/useOratorios'
import { getAttendancePersonName } from '../presentation'
import { QuickOratorianoConfirmationDialog } from './QuickOratorianoConfirmationDialog'
import { QuickOratorianoNameForm } from './QuickOratorianoNameForm'
import {
  QuickOratorianoRegistrationResults,
  type CheckedOratorianoName,
} from './QuickOratorianoRegistrationResults'

type QuickOratorianoRegistrationProps = {
  enabled: boolean
  onMarkExisting: (entry: AttendanceRosterEntry) => Promise<boolean>
  oratorioId: string
}

export function QuickOratorianoRegistration({
  enabled,
  onMarkExisting,
  oratorioId,
}: QuickOratorianoRegistrationProps) {
  const [checkedName, setCheckedName] = useState<CheckedOratorianoName | null>(null)
  const [page, setPage] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const mutation = useRegisterAndMarkOratoriano()
  const form = useForm<RegisterOratorianoFormValues>({
    defaultValues: { firstName: '', surname: '' },
    resolver: zodResolver(registerOratorianoSchema),
  })
  const firstName = useWatch({ control: form.control, name: 'firstName' })
  const surname = useWatch({ control: form.control, name: 'surname' })
  const currentKey = `${firstName}\u0000${surname}`
  const hasCurrentCheck = checkedName?.key === currentKey
  const fullName = checkedName
    ? `${checkedName.firstName} ${checkedName.surname}`
    : ''
  const query = useAttendanceRoster(
    oratorioId,
    'oratorianos',
    page,
    fullName,
    enabled && hasCurrentCheck,
  )
  const exactQuery = useExactOratorianoAttendanceMatch(
    oratorioId,
    checkedName?.firstName ?? '',
    checkedName?.surname ?? '',
    enabled && hasCurrentCheck,
  )
  const results = useMemo(
    () => hasCurrentCheck && !query.isError && !query.isPlaceholderData
      ? query.data?.items ?? []
      : [],
    [
      hasCurrentCheck,
      query.data?.items,
      query.isError,
      query.isPlaceholderData,
    ],
  )
  const currentPageExactMatch = useMemo(
    () => checkedName
      ? results.find((entry) => areHumanEquivalentNames(checkedName, entry.person ?? {}))
      : undefined,
    [checkedName, results],
  )
  const exactMatch = exactQuery.data ?? currentPageExactMatch
  const hasResolvedSearch = hasCurrentCheck
    && !query.isLoading
    && !query.isFetching
    && !query.isError
    && !query.isPlaceholderData
    && exactQuery.isSuccess
    && !exactQuery.isFetching
    && !exactQuery.isError
  const hasSearchError = query.isError || exactQuery.isError
  const isCheckingName = query.isLoading
    || exactQuery.isLoading
    || exactQuery.isFetching
  const canConfirmCreation = enabled
    && Boolean(checkedName)
    && hasResolvedSearch
    && !exactMatch
  const [isConfirmOpen, setIsConfirmOpen] = useCapabilityBoundState(
    canConfirmCreation,
    false,
  )

  const checkName = async () => {
    const valid = await form.trigger()
    if (!valid) return

    const rawValues = form.getValues()
    const parsedValues = registerOratorianoSchema.safeParse(rawValues)
    if (!parsedValues.success) return

    setPage(0)
    setFeedback(null)
    mutation.reset()
    // The similar-name check must complete before creation can be enabled.
    setCheckedName({
      ...parsedValues.data,
      key: `${rawValues.firstName}\u0000${rawValues.surname}`,
    })
  }

  const createAndMark = () => {
    if (!canConfirmCreation || !checkedName) return

    mutation.mutate(
      {
        oratorioId,
        payload: {
          firstName: checkedName.firstName,
          surname: checkedName.surname,
        },
      },
      {
        onSuccess: () => {
          setIsConfirmOpen(false)
          setFeedback(
            `${checkedName.firstName} ${checkedName.surname} foi cadastrado e marcado como presente.`,
          )
          form.reset()
          setCheckedName(null)
        },
      },
    )
  }

  const markFoundEntry = async (entry: AttendanceRosterEntry) => {
    if (!enabled) return

    const name = getAttendancePersonName(entry.person)
    const marked = await onMarkExisting(entry)
    if (marked) {
      setFeedback(`${name} foi marcado como presente.`)
      form.reset()
      setCheckedName(null)
    }
  }

  return (
    <Card className="border-primary/30 bg-primary/[0.03]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus aria-hidden="true" className="h-5 w-5 text-primary" />
          Cadastro rápido
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pergunte o nome completo e confira os cadastros parecidos antes de
          criar uma nova pessoa.
        </p>
      </CardHeader>
      <CardContent>
        <QuickOratorianoNameForm
          enabled={enabled}
          form={form}
          isCheckingName={isCheckingName}
          onCheckName={() => void checkName()}
        />

        {!enabled && (
          <Alert className="mt-4">
            <AlertTitle>Cadastro rápido indisponível.</AlertTitle>
            <AlertDescription>
              Ele só pode ser usado quando novas presenças estão abertas e sua
              conta pode cadastrar Oratorianos.
            </AlertDescription>
          </Alert>
        )}

        {checkedName && hasCurrentCheck && (
          <QuickOratorianoRegistrationResults
            checkedName={checkedName}
            currentPageExactMatch={currentPageExactMatch}
            enabled={enabled}
            exactMatch={exactMatch}
            hasResolvedSearch={hasResolvedSearch}
            hasSearchError={hasSearchError}
            isCheckingName={isCheckingName}
            isFetching={query.isFetching}
            isPlaceholderData={query.isPlaceholderData}
            onMarkExisting={markFoundEntry}
            onOpenConfirmation={() => setIsConfirmOpen(true)}
            onPageChange={setPage}
            onRetry={() => {
              void query.refetch()
              void exactQuery.refetch()
            }}
            page={page}
            results={results}
            rosterPage={query.data}
          />
        )}

        {mutation.isError && (
          <Alert className="mt-4" variant="destructive">
            <AlertTitle>
              Não foi possível cadastrar e marcar a presença.
            </AlertTitle>
            <AlertDescription>{getErrorMessage(mutation.error)}</AlertDescription>
          </Alert>
        )}
        {feedback && (
          <p
            aria-live="polite"
            className="mt-4 text-sm font-medium text-primary"
          >
            {feedback}
          </p>
        )}
      </CardContent>

      <QuickOratorianoConfirmationDialog
        canConfirm={canConfirmCreation}
        error={mutation.error}
        fullName={fullName}
        isOpen={isConfirmOpen}
        isPending={mutation.isPending}
        onConfirm={createAndMark}
        onOpenChange={setIsConfirmOpen}
      />
    </Card>
  )
}
