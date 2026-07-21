import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { EmptyState, ErrorState, LoadingState } from '@/components/AsyncState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
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
  useMemberByAccountEmail,
  useUpdateMemberCoordinator,
} from '@/features/manage/members'
import { getErrorMessage } from '@/lib/http'

import { accountAdminQueryKeys } from '../queryKeys'

const coordinatorTransitionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Informe o motivo da alteração.')
    .max(2000, 'O motivo deve ter no máximo 2.000 caracteres.'),
})

type CoordinatorTransitionValues = z.infer<typeof coordinatorTransitionSchema>

type AccountCoordinatorTransitionSectionProps = {
  accountId: string
  accountEmail: string | null | undefined
  isCoordinator: boolean
}

export function AccountCoordinatorTransitionSection({
  accountId,
  accountEmail,
  isCoordinator,
}: AccountCoordinatorTransitionSectionProps) {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const memberQuery = useMemberByAccountEmail(accountEmail ?? null)
  const coordinatorMutation = useUpdateMemberCoordinator()
  const form = useForm<CoordinatorTransitionValues>({
    resolver: zodResolver(coordinatorTransitionSchema),
    defaultValues: { reason: '' },
  })
  const action = isCoordinator ? 'revoke' : 'grant'
  const actionLabel = isCoordinator ? 'Remover coordenação' : 'Conceder coordenação'
  const confirmationLabel = isCoordinator ? 'Confirmar remoção' : 'Confirmar concessão'

  if (!accountEmail) {
    return (
      <EmptyState
        className="min-h-24"
        title="Não foi possível localizar o membro desta conta."
      />
    )
  }

  if (memberQuery.isLoading) {
    return <LoadingState className="min-h-24" title="Verificando vínculo com membro..." />
  }

  if (memberQuery.isError) {
    return (
      <ErrorState
        className="min-h-24"
        description="Não foi possível verificar o vínculo desta conta com um membro."
        onRetry={() => void memberQuery.refetch()}
      />
    )
  }

  const memberId = memberQuery.data
  if (!memberId) {
    return (
      <EmptyState
        className="min-h-24"
        title="Esta conta não está vinculada a um membro."
      />
    )
  }

  return (
    <section className="space-y-4 border-t pt-4" aria-labelledby="account-coordinator-transition-title">
      <div>
        <h3 id="account-coordinator-transition-title" className="font-semibold">
          Coordenação
        </h3>
        <p className="text-sm text-muted-foreground">
          {isCoordinator
            ? 'Esta pessoa faz parte da coordenação.'
            : 'Esta pessoa não faz parte da coordenação.'}
        </p>
      </div>

      {!isFormOpen && (
        <Button
          onClick={() => {
            form.reset()
            coordinatorMutation.reset()
            setIsFormOpen(true)
          }}
          type="button"
          variant={isCoordinator ? 'destructive' : 'default'}
        >
          {actionLabel}
        </Button>
      )}

      {isFormOpen && (
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(({ reason }) => {
              coordinatorMutation.mutate(
                { memberId, action, reason },
                {
                  onSuccess: () => {
                    form.reset()
                    setIsFormOpen(false)
                    void queryClient.invalidateQueries({
                      queryKey: accountAdminQueryKeys.roles(accountId),
                    })
                    void queryClient.invalidateQueries({
                      queryKey: [...accountAdminQueryKeys.all, 'search'],
                    })
                  },
                },
              )
            })}
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo da alteração</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      placeholder="Descreva o motivo da alteração"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {coordinatorMutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>Não foi possível atualizar a coordenação.</AlertTitle>
                <AlertDescription>{getErrorMessage(coordinatorMutation.error)}</AlertDescription>
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
              <Button disabled={coordinatorMutation.isPending} type="submit">
                {coordinatorMutation.isPending ? 'Salvando...' : confirmationLabel}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </section>
  )
}
