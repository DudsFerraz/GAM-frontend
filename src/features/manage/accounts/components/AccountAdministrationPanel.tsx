import { zodResolver } from '@hookform/resolvers/zod'
import { Shield, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { EmptyState, ErrorState, LoadingState } from '@/components/AsyncState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Textarea } from '@/components/ui/Textarea'
import { getRolePresentation } from '@/features/account'
import { getErrorMessage } from '@/lib/http'

import type { Account, Role } from '../api/accounts'
import { useAccountRoles, useDropAccountRole } from '../hooks/useAccountAdministration'
import { dropRoleSchema, type DropRoleValues } from '../schemas/accountRoleSchemas'

type Props = { account: Account; canManageRoles: boolean }

export function AccountAdministrationPanel({ account, canManageRoles }: Props) {
  const accountId = account.id ?? ''
  const [roleToDrop, setRoleToDrop] = useState<Role | null>(null)
  const rolesQuery = useAccountRoles(account.id ?? null)
  const dropMutation = useDropAccountRole(accountId)
  const dropForm = useForm<DropRoleValues>({
    resolver: zodResolver(dropRoleSchema),
    defaultValues: { reason: '' },
  })
  const roles = rolesQuery.data?.roles ?? []

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="px-5">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Conta selecionada</p>
        <CardTitle className="text-xl">{account.displayName ?? 'Conta sem nome'}</CardTitle>
        <p className="text-sm text-muted-foreground">{account.email}</p>
      </CardHeader>
      <CardContent className="space-y-5 px-5">
        <section className="space-y-3" aria-labelledby="account-roles-title">
          <h3 id="account-roles-title" className="flex items-center gap-2 font-semibold">
            <Shield className="h-4 w-4" />
            Tipos de acesso
          </h3>
          {rolesQuery.isLoading && <LoadingState className="min-h-32" />}
          {rolesQuery.isError && (
            <ErrorState className="min-h-32" onRetry={() => void rolesQuery.refetch()} />
          )}
          {!rolesQuery.isLoading && !rolesQuery.isError && roles.length === 0 && (
            <EmptyState className="min-h-32" title="Nenhum tipo de acesso disponível." />
          )}
          <div className="space-y-2">
            {roles.map((role, index) => {
              const presentation = getRolePresentation(role)

              return (
                <div className="rounded-lg border bg-background p-3" key={role.id ?? index}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{presentation.label}</p>
                      <p className="text-sm text-muted-foreground">{presentation.description}</p>
                    </div>
                    {role.id && canManageRoles && (
                      <Button
                        onClick={() => {
                          setRoleToDrop(role)
                          dropMutation.reset()
                          dropForm.reset()
                        }}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remover
                      </Button>
                    )}
                  </div>
                  {roleToDrop?.id === role.id && (
                    <Form {...dropForm}>
                      <form
                        className="mt-3 space-y-3 border-t pt-3"
                        onSubmit={dropForm.handleSubmit(({ reason }) => {
                          if (!role.id) return

                          dropMutation.mutate(
                            { roleId: role.id, reason },
                            {
                              onSuccess: () => {
                                setRoleToDrop(null)
                                dropForm.reset()
                              },
                            },
                          )
                        })}
                      >
                        <FormField
                          control={dropForm.control}
                          name="reason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Motivo da remoção</FormLabel>
                              <FormControl><Textarea maxLength={2000} {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {dropMutation.isError && (
                          <Alert variant="destructive">
                            <AlertTitle>Não foi possível remover o tipo de acesso.</AlertTitle>
                            <AlertDescription>{getErrorMessage(dropMutation.error)}</AlertDescription>
                          </Alert>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => setRoleToDrop(null)} size="sm" type="button" variant="ghost">
                            Cancelar
                          </Button>
                          <Button disabled={dropMutation.isPending} size="sm" type="submit" variant="destructive">
                            Confirmar remoção
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </CardContent>
    </Card>
  )
}
