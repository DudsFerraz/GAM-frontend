import { UserCheck, UserPlus, UsersRound } from 'lucide-react'

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/AsyncState'
import { Pagination } from '@/components/Pagination'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

import {
  areHumanEquivalentNames,
  type RegisterOratorianoFormValues,
} from '@/features/manage/oratorianos'

import type {
  AttendanceRosterEntry,
  AttendanceRosterPage,
} from '../api/oratorios'
import { getAttendancePersonName } from '../presentation'

export type CheckedOratorianoName = RegisterOratorianoFormValues & {
  key: string
}

type QuickOratorianoRegistrationResultsProps = {
  checkedName: CheckedOratorianoName
  currentPageExactMatch?: AttendanceRosterEntry
  enabled: boolean
  exactMatch?: AttendanceRosterEntry
  hasResolvedSearch: boolean
  hasSearchError: boolean
  isCheckingName: boolean
  isFetching: boolean
  isPlaceholderData: boolean
  page: number
  results: AttendanceRosterEntry[]
  rosterPage?: AttendanceRosterPage
  onMarkExisting: (entry: AttendanceRosterEntry) => Promise<void>
  onOpenConfirmation: () => void
  onPageChange: (page: number) => void
  onRetry: () => void
}

export function QuickOratorianoRegistrationResults({
  checkedName,
  currentPageExactMatch,
  enabled,
  exactMatch,
  hasResolvedSearch,
  hasSearchError,
  isCheckingName,
  isFetching,
  isPlaceholderData,
  onMarkExisting,
  onOpenConfirmation,
  onPageChange,
  onRetry,
  page,
  results,
  rosterPage,
}: QuickOratorianoRegistrationResultsProps) {
  return (
    <div className="mt-5 space-y-4">
      <div>
        <h3 className="font-semibold">Confira antes de cadastrar</h3>
        <p className="text-sm text-muted-foreground">
          Nenhum resultado é marcado automaticamente.
        </p>
      </div>

      {isCheckingName && (
        <LoadingState title="Procurando nomes parecidos..." />
      )}
      {hasSearchError && <ErrorState onRetry={onRetry} />}
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
            const isExact = areHumanEquivalentNames(
              checkedName,
              entry.person ?? {},
            )

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
                    onClick={() => void onMarkExisting(entry)}
                    size="sm"
                    type="button"
                  >
                    <UserCheck aria-hidden="true" className="h-4 w-4" />
                    Marcar este cadastro
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {!hasSearchError && !isPlaceholderData && rosterPage && (
        <Pagination
          disabled={isFetching}
          itemLabel="Oratorianos"
          onPageChange={onPageChange}
          page={rosterPage.page ?? page}
          totalElements={rosterPage.totalElements ?? results.length}
          totalPages={rosterPage.totalPages ?? 0}
        />
      )}

      {exactMatch ? (
        <Alert>
          <AlertTitle>Use o cadastro encontrado.</AlertTitle>
          <AlertDescription>
            <p>
              Um nome equivalente já existe, por isso um novo cadastro não
              pode ser criado.
            </p>
            {!currentPageExactMatch && (
              exactMatch.attendance ? (
                <Badge variant="secondary">Cadastro já marcado como presente</Badge>
              ) : (
                <Button
                  disabled={!enabled || !exactMatch.person?.id}
                  onClick={() => void onMarkExisting(exactMatch)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <UserCheck aria-hidden="true" className="h-4 w-4" />
                  Marcar cadastro encontrado
                </Button>
              )
            )}
          </AlertDescription>
        </Alert>
      ) : hasResolvedSearch ? (
        <Button disabled={!enabled} onClick={onOpenConfirmation} type="button">
          <UserPlus aria-hidden="true" className="h-4 w-4" />
          Cadastrar e marcar
        </Button>
      ) : null}
    </div>
  )
}
