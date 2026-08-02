import { UserPlus, UserRound, UserX, X } from 'lucide-react'
import { useState } from 'react'

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/AsyncState'
import { Pagination } from '@/components/Pagination'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { SearchClearButton } from '@/components/SearchClearButton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { getErrorMessage, isForbiddenError } from '@/lib/http'
import { useCapabilityBoundState } from '@/hooks/useCapabilityBoundState'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

import type {
  OratorioTeam,
  OratorioTeamType,
} from '../api/oratorios'
import {
  useAssignOratorioTeamMember,
  useAttendanceRoster,
  useRemoveOratorioTeamMember,
} from '../hooks/useOratorios'
import {
  getAttendancePersonName,
  getOratorioTeamLabel,
  ORATORIO_TEAM_LABELS,
} from '../presentation'

const TEAM_TYPES = Object.keys(
  ORATORIO_TEAM_LABELS,
) as OratorioTeamType[]

type OratorioTeamsSectionProps = {
  canManage: boolean
  canReadRoster: boolean
  oratorioId: string
  teams?: OratorioTeam[] | null
}

export function OratorioTeamsSection({
  canManage,
  canReadRoster,
  oratorioId,
  teams,
}: OratorioTeamsSectionProps) {
  const canPickMembers = canManage && canReadRoster
  const [selectedTeamType, setSelectedTeamType] =
    useCapabilityBoundState<OratorioTeamType | null>(
      canPickMembers,
      null,
    )
  const removeMutation = useRemoveOratorioTeamMember()

  return (
    <section aria-labelledby="oratorio-teams-title" className="space-y-4">
      <div>
        <h2
          className="font-heading text-xl font-bold"
          id="oratorio-teams-title"
        >
          Equipes
        </h2>
        <p className="text-sm text-muted-foreground">
          As quatro equipes são fixas; atribua os membros responsáveis por
          esta data.
        </p>
      </div>

      {removeMutation.isError && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível remover o membro.</AlertTitle>
          <AlertDescription>
            {getErrorMessage(removeMutation.error)}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {TEAM_TYPES.map((teamType) => {
          const team = teams?.find((item) => item.type === teamType)
          const members = team?.members ?? []

          return (
            <Card className="gap-4" key={teamType}>
              <CardHeader className="flex grid-cols-none flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle>{getOratorioTeamLabel(teamType)}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {members.length === 0
                      ? 'Nenhum membro atribuído'
                      : `${members.length} ${members.length === 1 ? 'membro' : 'membros'}`}
                  </p>
                </div>
                {canPickMembers && (
                  <Button
                    aria-label={`Adicionar membro à ${getOratorioTeamLabel(teamType)}`}
                    onClick={() => setSelectedTeamType(teamType)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <UserPlus aria-hidden="true" className="h-4 w-4" />
                    Adicionar
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    A equipe está disponível para receber atribuições.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {members.map((member, index) => {
                      const fullName = [member.firstName, member.surname]
                        .filter(Boolean)
                        .join(' ') || 'Nome não informado'
                      const memberId = member.id
                      const isRemoving = removeMutation.isPending
                        && removeMutation.variables?.memberId === memberId
                        && removeMutation.variables?.teamType === teamType

                      return (
                        <li
                          className="flex min-h-12 items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2"
                          key={memberId ?? index}
                        >
                          <UserRound
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0 text-primary"
                          />
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">
                            {fullName}
                          </span>
                          {member.status === 'INACTIVE' && (
                            <Badge variant="outline">Inativo</Badge>
                          )}
                          {canManage && memberId && (
                            <Button
                              aria-label={`Remover ${fullName} da ${getOratorioTeamLabel(teamType)}`}
                              disabled={isRemoving}
                              onClick={() =>
                                removeMutation.mutate({
                                  memberId,
                                  oratorioId,
                                  teamType,
                                })
                              }
                              size="icon-sm"
                              title="Remover da equipe"
                              type="button"
                              variant="ghost"
                            >
                              <X aria-hidden="true" className="h-4 w-4" />
                            </Button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {canManage && !canReadRoster && (
        <Alert>
          <UserX aria-hidden="true" className="h-4 w-4" />
          <AlertTitle>A seleção de membros não está disponível.</AlertTitle>
          <AlertDescription>
            Sua conta pode gerenciar o planejamento, mas não possui acesso à
            busca operacional de participantes.
          </AlertDescription>
        </Alert>
      )}

      {selectedTeamType && (
        <OratorioMemberPicker
          assignedMemberIds={
            teams
              ?.find((team) => team.type === selectedTeamType)
              ?.members
              ?.flatMap((member) => member.id ? [member.id] : []) ?? []
          }
          onOpenChange={(open) => {
            if (!open) setSelectedTeamType(null)
          }}
          canManage={canManage}
          canReadRoster={canReadRoster}
          open={canPickMembers}
          oratorioId={oratorioId}
          teamType={selectedTeamType}
        />
      )}
    </section>
  )
}

function OratorioMemberPicker({
  assignedMemberIds,
  canManage,
  canReadRoster,
  onOpenChange,
  open,
  oratorioId,
  teamType,
}: {
  assignedMemberIds: string[]
  canManage: boolean
  canReadRoster: boolean
  onOpenChange: (open: boolean) => void
  open: boolean
  oratorioId: string
  teamType: OratorioTeamType
}) {
  const [nameInput, setNameInput] = useState('')
  const [page, setPage] = useState(0)
  const canOperate = open && canManage && canReadRoster
  const normalizedNameInput = nameInput.trim()
  const name = useDebouncedValue(normalizedNameInput)
  const isSearchSettled = normalizedNameInput === name
  const queryPage = isSearchSettled ? page : 0

  const query = useAttendanceRoster(
    oratorioId,
    'members',
    queryPage,
    name,
    canOperate && isSearchSettled,
  )
  const assignMutation = useAssignOratorioTeamMember()
  const availableItems = (query.data?.items ?? []).filter((entry) => {
    const personId = entry.person?.id
    return personId
      && entry.person?.status === 'ACTIVE'
      && !assignedMemberIds.includes(personId)
  })

  return (
    <Dialog onOpenChange={onOpenChange} open={canOperate}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Adicionar à {getOratorioTeamLabel(teamType)}
          </DialogTitle>
          <DialogDescription>
            Busque um membro ativo pelo nome. Pessoas já atribuídas a esta
            equipe não aparecem entre as opções.
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <Label className="sr-only" htmlFor={`member-search-${teamType}`}>
              Nome do membro
            </Label>
            <Input
              className="pr-10"
              id={`member-search-${teamType}`}
              onChange={(event) => {
                setNameInput(event.target.value)
                setPage(0)
              }}
              placeholder="Buscar membro pelo nome"
              type="search"
              value={nameInput}
            />
            {nameInput && (
              <SearchClearButton
                onClear={() => {
                  setNameInput('')
                  setPage(0)
                }}
              />
            )}
          </div>
        </div>

        {query.isLoading && (
          <LoadingState title="Carregando membros..." />
        )}
        {query.isError && (
          isForbiddenError(query.error) ? (
            <ForbiddenState description="Sua conta não tem acesso à busca de membros para equipes." />
          ) : (
            <ErrorState onRetry={() => void query.refetch()} />
          )
        )}
        {!query.isLoading
          && !query.isError
          && availableItems.length === 0 && (
          <EmptyState
            description="Tente outro nome ou confira se a pessoa já faz parte da equipe."
            title="Nenhum membro disponível."
          />
        )}
        {!query.isError && availableItems.length > 0 && (
          <ul className="space-y-2">
            {availableItems.map((entry) => {
              const personId = entry.person?.id
              if (!personId) return null

              const fullName = getAttendancePersonName(entry.person)
              const isAssigning = assignMutation.isPending
                && assignMutation.variables?.memberId === personId

              return (
                <li
                  className="flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2"
                  key={personId}
                >
                  <UserRound
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-primary"
                  />
                  <span className="min-w-0 flex-1 font-medium">
                    {fullName}
                  </span>
                  <Button
                    disabled={!canOperate || isAssigning}
                    onClick={() => {
                      if (!canOperate) return

                      assignMutation.mutate({
                        memberId: personId,
                        oratorioId,
                        teamType,
                      }, {
                        onSuccess: () => onOpenChange(false),
                      })
                    }}
                    size="sm"
                    type="button"
                  >
                    {isAssigning ? 'Adicionando...' : 'Adicionar'}
                  </Button>
                </li>
              )
            })}
          </ul>
        )}

        {assignMutation.isError && (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível adicionar o membro.</AlertTitle>
            <AlertDescription>
              {getErrorMessage(assignMutation.error)}
            </AlertDescription>
          </Alert>
        )}

        {!query.isError && query.data && (
          <Pagination
            disabled={query.isFetching}
            itemLabel="membros"
            onPageChange={setPage}
            page={query.data.page ?? queryPage}
            totalElements={query.data.totalElements ?? availableItems.length}
            totalPages={query.data.totalPages ?? 0}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
