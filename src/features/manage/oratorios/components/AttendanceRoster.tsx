import { UserRound } from 'lucide-react'

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/AsyncState'
import { Pagination } from '@/components/Pagination'
import { SearchClearButton } from '@/components/SearchClearButton'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { isForbiddenError } from '@/lib/http'

import type {
  AttendanceKind,
  AttendanceRosterEntry,
  AttendanceRosterPage,
} from '../api/oratorios'
import type { AttendanceAvailability } from '../attendanceRules'
import { getAttendancePersonName } from '../presentation'

type AttendanceRosterProps = {
  availability: AttendanceAvailability
  canManage: boolean
  error: unknown
  isError: boolean
  isFetching: boolean
  isLoading: boolean
  kind: AttendanceKind
  nameInput: string
  onNameInputChange: (name: string) => void
  onPageChange: (page: number) => void
  onRetry: () => void
  onToggle: (
    kind: AttendanceKind,
    entry: AttendanceRosterEntry,
    checked: boolean,
  ) => void
  page: number
  pendingKeys: ReadonlySet<string>
  roster?: AttendanceRosterPage
}

export function AttendanceRoster({
  availability,
  canManage,
  error,
  isError,
  isFetching,
  isLoading,
  kind,
  nameInput,
  onNameInputChange,
  onPageChange,
  onRetry,
  onToggle,
  page,
  pendingKeys,
  roster,
}: AttendanceRosterProps) {
  const items = roster?.items ?? []
  const participantLabel = kind === 'members'
    ? 'membros'
    : 'Oratorianos'

  return (
    <div className="space-y-4">
      <div
        className="flex flex-col gap-2 sm:flex-row"
      >
        <div className="relative flex-1">
          <Label className="sr-only" htmlFor={`attendance-search-${kind}`}>
            Buscar {participantLabel} pelo nome
          </Label>
          <Input
            className="pr-10"
            id={`attendance-search-${kind}`}
            onChange={(event) => onNameInputChange(event.target.value)}
            placeholder={`Buscar ${participantLabel} pelo nome`}
            type="search"
            value={nameInput}
          />
          {nameInput && (
            <SearchClearButton onClear={() => onNameInputChange('')} />
          )}
        </div>
      </div>

      {isLoading && (
        <LoadingState title={`Carregando ${participantLabel}...`} />
      )}
      {isError && (
        isForbiddenError(error) ? (
          <ForbiddenState
            description={`Sua conta não tem acesso à lista de ${participantLabel}.`}
          />
        ) : (
          <ErrorState onRetry={onRetry} />
        )
      )}
      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          description="Tente outro nome ou confira se há cadastros disponíveis."
          title={`Nenhum ${kind === 'members' ? 'membro' : 'Oratoriano'} encontrado.`}
        />
      )}
      {!isError && items.length > 0 && (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {items.map((entry, index) => {
            const personId = entry.person?.id
            const personName = getAttendancePersonName(entry.person)
            const checked = Boolean(entry.attendance)
            const pendingKey = personId ? `${kind}:${personId}` : ''
            const isPending = pendingKeys.has(pendingKey)
            const isDisabled = !personId
              || !canManage
              || isPending
              || (checked
                ? !availability.canUncheck
                : !availability.canMark)
            const checkboxId = personId
              ? `attendance-${kind}-${personId}`
              : `attendance-${kind}-unknown-${index}`

            return (
              <li key={personId ?? index}>
                <label
                  className="flex min-h-16 cursor-pointer touch-manipulation items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-70"
                  htmlFor={checkboxId}
                >
                  <Checkbox
                    aria-label={`${checked ? 'Remover' : 'Marcar'} presença de ${personName}`}
                    checked={checked}
                    disabled={isDisabled}
                    id={checkboxId}
                    onCheckedChange={(nextChecked) =>
                      onToggle(kind, entry, nextChecked === true)
                    }
                  />
                  <UserRound
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {personName}
                    </span>
                    {entry.person?.deleted && (
                      <span className="block text-xs text-muted-foreground">
                        Cadastro removido
                      </span>
                    )}
                  </span>
                  {isPending ? (
                    <span className="text-xs font-medium text-muted-foreground">
                      Salvando...
                    </span>
                  ) : checked ? (
                    <Badge variant="secondary">Presente</Badge>
                  ) : null}
                </label>
              </li>
            )
          })}
        </ul>
      )}
      {!isError && roster && (
        <Pagination
          disabled={isFetching}
          itemLabel={participantLabel}
          onPageChange={onPageChange}
          page={roster.page ?? page}
          totalElements={roster.totalElements ?? items.length}
          totalPages={roster.totalPages ?? 0}
        />
      )}
    </div>
  )
}
