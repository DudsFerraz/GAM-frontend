import { zodResolver } from '@hookform/resolvers/zod'
import { Search, UserCheck, UserPlus, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/AsyncState'
import { Pagination } from '@/components/Pagination'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import {
  areHumanEquivalentNames,
  registerOratorianoSchema,
  type RegisterOratorianoFormValues,
} from '@/features/manage/oratorianos'
import { getErrorMessage } from '@/lib/http'
import { useCapabilityBoundState } from '@/hooks/useCapabilityBoundState'

import type { AttendanceRosterEntry } from '../api/oratorios'
import {
  useAttendanceRoster,
  useExactOratorianoAttendanceMatch,
  useRegisterAndMarkOratoriano,
} from '../hooks/useOratorios'
import { getAttendancePersonName } from '../presentation'

type CheckedName = RegisterOratorianoFormValues & {
  key: string
}

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
  const [checkedName, setCheckedName] = useState<CheckedName | null>(null)
  const [page, setPage] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const mutation = useRegisterAndMarkOratoriano()
  const form = useForm<RegisterOratorianoFormValues>({
    defaultValues: { firstName: '', surname: '' },
    resolver: zodResolver(registerOratorianoSchema),
  })
  const firstName = useWatch({
    control: form.control,
    name: 'firstName',
  })
  const surname = useWatch({
    control: form.control,
    name: 'surname',
  })
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
    () =>
      hasCurrentCheck && !query.isError && !query.isPlaceholderData
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
      ? results.find((entry) =>
          areHumanEquivalentNames(
            checkedName,
            entry.person ?? {},
          ),
        )
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
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void checkName()
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        disabled={!enabled}
                        maxLength={32}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome completo</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        disabled={!enabled}
                        maxLength={64}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              disabled={
                !enabled
                || query.isFetching
                || exactQuery.isFetching
              }
              type="submit"
              variant="outline"
            >
              <Search aria-hidden="true" className="h-4 w-4" />
              Conferir nome
            </Button>
          </form>
        </Form>

        {!enabled && (
          <Alert className="mt-4">
            <AlertTitle>Cadastro rápido indisponível.</AlertTitle>
            <AlertDescription>
              Ele só pode ser usado quando novas presenças estão abertas e sua
              conta pode cadastrar Oratorianos.
            </AlertDescription>
          </Alert>
        )}

        {hasCurrentCheck && (
          <div className="mt-5 space-y-4">
            <div>
              <h3 className="font-semibold">
                Confira antes de cadastrar
              </h3>
              <p className="text-sm text-muted-foreground">
                Nenhum resultado é marcado automaticamente.
              </p>
            </div>

            {isCheckingName && (
              <LoadingState title="Procurando nomes parecidos..." />
            )}
            {hasSearchError && (
              <ErrorState
                onRetry={() => {
                  void query.refetch()
                  void exactQuery.refetch()
                }}
              />
            )}
            {hasResolvedSearch && results.length === 0 && (
              <EmptyState
                description="Confira a grafia com a pessoa antes de continuar."
                title="Nenhum cadastro parecido encontrado."
              />
            )}
            {!hasSearchError && results.length > 0 && (
              <ul className="space-y-2">
                {results.map((entry, index) => {
                  const personId = entry.person?.id
                  const name = getAttendancePersonName(entry.person)
                  const isExact = checkedName
                    ? areHumanEquivalentNames(
                        checkedName,
                        entry.person ?? {},
                      )
                    : false

                  return (
                    <li
                      className="flex flex-col gap-3 rounded-lg border bg-background px-3 py-3 sm:flex-row sm:items-center"
                      key={personId ?? index}
                    >
                      <UsersRound
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-primary"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{name}</span>
                        {isExact && (
                          <span className="mt-1 block text-xs text-muted-foreground">
                            Mesmo nome após ignorar caixa, acentos e espaços.
                          </span>
                        )}
                      </span>
                      {entry.attendance ? (
                        <Badge variant="secondary">Já presente</Badge>
                      ) : (
                        <Button
                          disabled={!personId}
                          onClick={() => void markFoundEntry(entry)}
                          size="sm"
                          type="button"
                        >
                          <UserCheck
                            aria-hidden="true"
                            className="h-4 w-4"
                          />
                          Marcar este cadastro
                        </Button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}

            {!hasSearchError
              && !query.isPlaceholderData
              && query.data && (
              <Pagination
                disabled={query.isFetching}
                itemLabel="Oratorianos"
                onPageChange={setPage}
                page={query.data.page ?? page}
                totalElements={query.data.totalElements ?? results.length}
                totalPages={query.data.totalPages ?? 0}
              />
              )}

            {exactMatch ? (
              <Alert>
                <AlertTitle>Use o cadastro encontrado.</AlertTitle>
                <AlertDescription>
                  <p>
                    Um nome equivalente já existe, por isso um novo cadastro
                    não pode ser criado.
                  </p>
                  {!currentPageExactMatch && (
                    exactMatch.attendance ? (
                      <Badge variant="secondary">
                        Cadastro já marcado como presente
                      </Badge>
                    ) : (
                      <Button
                        disabled={!enabled || !exactMatch.person?.id}
                        onClick={() => void markFoundEntry(exactMatch)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <UserCheck
                          aria-hidden="true"
                          className="h-4 w-4"
                        />
                        Marcar cadastro encontrado
                      </Button>
                    )
                  )}
                </AlertDescription>
              </Alert>
            ) : hasResolvedSearch ? (
              <Button
                disabled={!enabled}
                onClick={() => setIsConfirmOpen(true)}
                type="button"
              >
                <UserPlus aria-hidden="true" className="h-4 w-4" />
                Cadastrar e marcar
              </Button>
            ) : null}
          </div>
        )}

        {mutation.isError && (
          <Alert className="mt-4" variant="destructive">
            <AlertTitle>
              Não foi possível cadastrar e marcar a presença.
            </AlertTitle>
            <AlertDescription>
              {getErrorMessage(mutation.error)}
            </AlertDescription>
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

      <AlertDialog
        onOpenChange={setIsConfirmOpen}
        open={isConfirmOpen && canConfirmCreation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cadastrar e marcar como presente?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Será criado um cadastro para {fullName} e a presença será
              registrada nesta mesma operação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {mutation.isError && (
            <Alert variant="destructive">
              <AlertTitle>Não foi possível concluir.</AlertTitle>
              <AlertDescription>
                {getErrorMessage(mutation.error)}
              </AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>
              Voltar e conferir
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!canConfirmCreation || mutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                createAndMark()
              }}
            >
              {mutation.isPending
                ? 'Cadastrando...'
                : 'Confirmar cadastro e presença'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
