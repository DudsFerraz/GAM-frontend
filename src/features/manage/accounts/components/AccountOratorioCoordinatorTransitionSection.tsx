import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
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
import {
  useMemberByAccountEmail,
  useUpdateMemberOratorioCoordinator,
} from '@/features/manage/members'
import { getErrorMessage, isForbiddenError } from '@/lib/http'

import { accountAdminQueryKeys } from '../queryKeys'

const oratorioCoordinatorTransitionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Informe o motivo da alteração.')
    .refine(
      (reason) => Array.from(reason).length <= 2000,
      'O motivo deve ter no máximo 2.000 caracteres.',
    ),
})

type OratorioCoordinatorTransitionValues = z.infer<
  typeof oratorioCoordinatorTransitionSchema
>

type AccountOratorioCoordinatorTransitionSectionProps = {
  accountId: string
  accountEmail: string | null | undefined
  hasActiveMemberProjection: boolean
  isOratorioCoordinator: boolean
}

export function AccountOratorioCoordinatorTransitionSection({
  accountId,
  accountEmail,
  hasActiveMemberProjection,
  isOratorioCoordinator,
}: AccountOratorioCoordinatorTransitionSectionProps) {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const memberQuery = useMemberByAccountEmail(accountEmail ?? null)
  const coordinatorMutation = useUpdateMemberOratorioCoordinator()
  const form = useForm<OratorioCoordinatorTransitionValues>({
    resolver: zodResolver(oratorioCoordinatorTransitionSchema),
    defaultValues: { reason: '' },
  })
  const action = isOratorioCoordinator ? 'revoke' : 'grant'
  const actionLabel = isOratorioCoordinator
    ? 'Remover da coordenação do Oratório'
    : 'Designar como coordenação do Oratório'
  const confirmationLabel = isOratorioCoordinator
    ? 'Confirmar remoção'
    : 'Confirmar designação'
  const reason = useWatch({ control: form.control, name: 'reason' })
  const reasonLength = Array.from(reason).length
  const member = memberQuery.data

  const refreshAccountState = () => {
    void queryClient.invalidateQueries({
      queryKey: accountAdminQueryKeys.roles(accountId),
    })
    void queryClient.invalidateQueries({
      queryKey: [...accountAdminQueryKeys.all, 'search'],
    })
  }

  let content: ReactNode

  if (!accountEmail) {
    content = (
      <EmptyState
        className="min-h-28"
        description="Informe o e-mail da conta antes de verificar o vínculo com membro."
        title="Não foi possível localizar o membro desta conta."
      />
    )
  } else if (memberQuery.isLoading) {
    content = (
      <LoadingState
        className="min-h-28"
        title="Verificando vínculo com membro..."
      />
    )
  } else if (memberQuery.isError) {
    content = isForbiddenError(memberQuery.error) ? (
      <ForbiddenState
        className="min-h-28"
        description="A consulta necessária ao vínculo não está disponível para sua conta, então a ação permanecerá indisponível."
        title="Não é possível selecionar este membro com segurança."
      />
    ) : (
      <ErrorState
        className="min-h-28"
        description="Não foi possível verificar se esta conta está vinculada a um membro ativo."
        onRetry={() => void memberQuery.refetch()}
      />
    )
  } else if (!member) {
    content = (
      <EmptyState
        className="min-h-28"
        description="A designação está disponível somente para pessoas com vínculo de membro."
        title="Esta conta não está vinculada a um membro."
      />
    )
  } else if (member.status === 'INACTIVE') {
    content = (
      <EmptyState
        className="min-h-28"
        description="Somente membros ativos podem receber ou manter essa responsabilidade."
        title="O vínculo com membro está inativo."
      />
    )
  } else if (!hasActiveMemberProjection) {
    content = (
      <ErrorState
        className="min-h-28"
        description="Os tipos de acesso desta conta não correspondem à situação ativa do membro."
        onRetry={() => {
          void memberQuery.refetch()
          refreshAccountState()
        }}
        title="O vínculo com membro está inconsistente."
      />
    )
  } else {
    content = (
      <>
        <p className="text-sm text-muted-foreground">
          {isOratorioCoordinator
            ? 'Esta pessoa possui a responsabilidade de coordenação do Oratório.'
            : 'Esta pessoa ainda não possui a responsabilidade de coordenação do Oratório.'}
        </p>

        {!isFormOpen && (
          <Button
            onClick={() => {
              form.reset()
              coordinatorMutation.reset()
              setIsFormOpen(true)
            }}
            type="button"
            variant={isOratorioCoordinator ? 'destructive' : 'default'}
          >
            {actionLabel}
          </Button>
        )}

        {isFormOpen && (
          <Form {...form}>
            <form
              className="space-y-4"
              noValidate
              onSubmit={form.handleSubmit(({ reason }) => {
                coordinatorMutation.mutate(
                  {
                    action,
                    memberId: member.id,
                    reason,
                  },
                  {
                    onError: () => {
                      void memberQuery.refetch()
                      refreshAccountState()
                    },
                    onSuccess: () => {
                      form.reset()
                      setIsFormOpen(false)
                      refreshAccountState()
                    },
                  },
                )
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

              {coordinatorMutation.isError && (
                <Alert variant="destructive">
                  <AlertTitle>
                    Não foi possível atualizar a coordenação do Oratório.
                  </AlertTitle>
                  <AlertDescription>
                    {getErrorMessage(coordinatorMutation.error)}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    form.reset()
                    coordinatorMutation.reset()
                    setIsFormOpen(false)
                  }}
                  type="button"
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  disabled={coordinatorMutation.isPending}
                  type="submit"
                  variant={isOratorioCoordinator ? 'destructive' : 'default'}
                >
                  {coordinatorMutation.isPending
                    ? 'Salvando...'
                    : confirmationLabel}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </>
    )
  }

  return (
    <section
      className="space-y-4 border-t pt-4"
      aria-labelledby="account-oratorio-coordinator-transition-title"
    >
      <div>
        <h3
          id="account-oratorio-coordinator-transition-title"
          className="font-semibold"
        >
          Coordenação do Oratório
        </h3>
        <p className="text-sm text-muted-foreground">
          Responsabilidade operacional vinculada ao ciclo de membro.
        </p>
      </div>
      {content}
    </section>
  )
}
