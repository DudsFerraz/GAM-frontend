import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/AsyncState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Textarea } from '@/components/ui/Textarea'
import { useAccountRoles } from '@/features/manage/accounts'
import { getErrorMessage, isForbiddenError } from '@/lib/http'

import { useUpdateMemberCoordinator } from '../hooks/useUpdateMemberCoordinator'
import { useUpdateMemberOratorioCoordinator } from '../hooks/useUpdateMemberOratorioCoordinator'
import type { MemberListItem } from '../types'

const roleTransitionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Informe o motivo da alteração.')
    .refine(
      (reason) => Array.from(reason).length <= 2000,
      'O motivo deve ter no máximo 2.000 caracteres.',
    ),
})

type RoleTransitionValues = z.infer<typeof roleTransitionSchema>

type MemberRoleTransitionProps = {
  actionLabel: string
  assignedDescription: string
  confirmationLabel: string
  error: unknown
  id: string
  isAssigned: boolean
  isError: boolean
  isPending: boolean
  onReset: () => void
  onSubmit: (reason: string, afterSuccess: () => void) => void
  title: string
  unassignedDescription: string
}

function MemberRoleTransition({
  actionLabel,
  assignedDescription,
  confirmationLabel,
  error,
  id,
  isAssigned,
  isError,
  isPending,
  onReset,
  onSubmit,
  title,
  unassignedDescription,
}: MemberRoleTransitionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const form = useForm<RoleTransitionValues>({
    resolver: zodResolver(roleTransitionSchema),
    defaultValues: { reason: '' },
  })
  const reason = useWatch({ control: form.control, name: 'reason' })
  const reasonLength = Array.from(reason ?? '').length

  return (
    <section className="space-y-3 p-4" aria-labelledby={`${id}-title`}>
      <div>
        <h4 id={`${id}-title`} className="font-semibold">
          {title}
        </h4>
        <p className="text-sm text-muted-foreground">
          {isAssigned ? assignedDescription : unassignedDescription}
        </p>
      </div>

      {!isFormOpen && (
        <Button
          onClick={() => {
            form.reset()
            onReset()
            setIsFormOpen(true)
          }}
          type="button"
          variant={isAssigned ? 'destructive' : 'default'}
        >
          {actionLabel}
        </Button>
      )}

      {isFormOpen && (
        <Form {...form}>
          <form
            className="space-y-4"
            noValidate
            onSubmit={form.handleSubmit(({ reason: submittedReason }) => {
              onSubmit(submittedReason, () => {
                form.reset()
                setIsFormOpen(false)
              })
            })}
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem required>
                  <FormLabel>Motivo da alteração</FormLabel>
                  <FormControl>
                    <Textarea
                      autoComplete="off"
                      placeholder="Descreva o motivo da alteração"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {reasonLength.toLocaleString('pt-BR')} de 2.000 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isError && (
              <Alert variant="destructive">
                <AlertTitle>Não foi possível atualizar este cargo.</AlertTitle>
                <AlertDescription>{getErrorMessage(error)}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  form.reset()
                  onReset()
                  setIsFormOpen(false)
                }}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                disabled={isPending}
                type="submit"
                variant={isAssigned ? 'destructive' : 'default'}
              >
                {isPending ? 'Salvando...' : confirmationLabel}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </section>
  )
}

type MemberRolesManagementSectionProps = {
  canManageCoordinator: boolean
  canManageOratorioCoordinator: boolean
  member: MemberListItem
}

export function MemberRolesManagementSection({
  canManageCoordinator,
  canManageOratorioCoordinator,
  member,
}: MemberRolesManagementSectionProps) {
  const accountId = member.accountId
  const rolesQuery = useAccountRoles(
    accountId,
    member.status === 'ACTIVE',
  )
  const coordinatorMutation = useUpdateMemberCoordinator()
  const oratorioCoordinatorMutation = useUpdateMemberOratorioCoordinator()

  let content: ReactNode

  if (!accountId) {
    content = (
      <EmptyState
        className="min-h-28"
        description="A gestão de cargos exige uma conta vinculada ao membro."
        title="Este membro não possui uma conta vinculada."
      />
    )
  } else if (member.status === 'INACTIVE') {
    content = (
      <EmptyState
        className="min-h-28"
        description="Somente membros ativos podem receber ou manter responsabilidades de coordenação."
        title="O vínculo com membro está inativo."
      />
    )
  } else if (member.status !== 'ACTIVE') {
    content = (
      <ErrorState
        className="min-h-28"
        description="Atualize os dados do membro antes de gerenciar seus cargos."
        title="A situação do membro não foi identificada."
      />
    )
  } else if (rolesQuery.isLoading) {
    content = <LoadingState className="min-h-28" title="Carregando cargos..." />
  } else if (rolesQuery.isError) {
    content = isForbiddenError(rolesQuery.error) ? (
      <ForbiddenState
        className="min-h-28"
        description="Sua conta não pode consultar os cargos necessários para realizar esta alteração."
        title="A gestão de cargos não está disponível."
      />
    ) : (
      <ErrorState
        className="min-h-28"
        description="Não foi possível carregar os cargos deste membro."
        onRetry={() => void rolesQuery.refetch()}
      />
    )
  } else {
    const roles = rolesQuery.data?.roles ?? []
    const isCoordinator = roles.some((role) => role.name === 'COORD')
    const isOratorioCoordinator = roles.some(
      (role) => role.name === 'ORATORIO_COORD',
    )
    const hasActiveMemberProjection =
      roles.some((role) => role.name === 'MEMBER')
      && !roles.some((role) => role.name === 'VISITOR')

    content = !hasActiveMemberProjection ? (
      <ErrorState
        className="min-h-28"
        description="Os cargos desta conta não correspondem à situação ativa do membro."
        onRetry={() => void rolesQuery.refetch()}
        title="O vínculo com membro está inconsistente."
      />
    ) : (
      <div className="divide-y rounded-xl border bg-background">
        {canManageCoordinator && (
          <MemberRoleTransition
            actionLabel={
              isCoordinator ? 'Remover coordenação' : 'Conceder coordenação'
            }
            assignedDescription="Esta pessoa faz parte da coordenação."
            confirmationLabel={
              isCoordinator ? 'Confirmar remoção' : 'Confirmar concessão'
            }
            error={coordinatorMutation.error}
            id="member-coordinator-transition"
            isAssigned={isCoordinator}
            isError={coordinatorMutation.isError}
            isPending={coordinatorMutation.isPending}
            onReset={coordinatorMutation.reset}
            onSubmit={(reason, afterSuccess) => {
              coordinatorMutation.mutate(
                {
                  action: isCoordinator ? 'revoke' : 'grant',
                  accountId,
                  memberId: member.id,
                  reason,
                },
                {
                  onError: () => void rolesQuery.refetch(),
                  onSuccess: afterSuccess,
                },
              )
            }}
            title="Coordenação"
            unassignedDescription="Esta pessoa não faz parte da coordenação."
          />
        )}

        {canManageOratorioCoordinator && (
          <MemberRoleTransition
              actionLabel={
                isOratorioCoordinator
                  ? 'Remover da coordenação do Oratório'
                  : 'Designar como coordenação do Oratório'
              }
              assignedDescription="Esta pessoa possui a responsabilidade de coordenação do Oratório."
              confirmationLabel={
                isOratorioCoordinator
                  ? 'Confirmar remoção'
                  : 'Confirmar designação'
              }
              error={oratorioCoordinatorMutation.error}
              id="member-oratorio-coordinator-transition"
              isAssigned={isOratorioCoordinator}
              isError={oratorioCoordinatorMutation.isError}
              isPending={oratorioCoordinatorMutation.isPending}
              onReset={oratorioCoordinatorMutation.reset}
              onSubmit={(reason, afterSuccess) => {
                oratorioCoordinatorMutation.mutate(
                  {
                    action: isOratorioCoordinator ? 'revoke' : 'grant',
                    accountId,
                    memberId: member.id,
                    reason,
                  },
                  {
                    onError: () => void rolesQuery.refetch(),
                    onSuccess: afterSuccess,
                  },
                )
              }}
              title="Coordenação do Oratório"
              unassignedDescription="Esta pessoa ainda não possui a responsabilidade de coordenação do Oratório."
          />
        )}
      </div>
    )
  }

  return (
    <section
      className="space-y-4 border-t pt-4"
      aria-labelledby="member-roles-management-title"
    >
      <div>
        <h3 id="member-roles-management-title" className="font-semibold">
          Cargos e responsabilidades
        </h3>
        <p className="text-sm text-muted-foreground">
          Conceda ou remova responsabilidades com uma justificativa.
        </p>
      </div>
      {content}
    </section>
  )
}
