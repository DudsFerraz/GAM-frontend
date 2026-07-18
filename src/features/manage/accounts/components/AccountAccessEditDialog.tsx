import { zodResolver } from '@hookform/resolvers/zod'
import { Shield, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { EmptyState, ErrorState, LoadingState } from '@/components/AsyncState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Textarea } from '@/components/ui/Textarea'
import { getRolePresentation } from '@/features/account'
import { getErrorMessage } from '@/lib/http'

import type { Account, Role } from '../api/accounts'
import { useAccountRoles, useDropAccountRole } from '../hooks/useAccountAdministration'
import { dropRoleSchema, type DropRoleValues } from '../schemas/accountRoleSchemas'

type AccountAccessEditDialogProps = {
  account: Account | null
  canManageRoles: boolean
  onClose: () => void
}

export function AccountAccessEditDialog({
  account,
  canManageRoles,
  onClose,
}: AccountAccessEditDialogProps) {
  const accountId = account?.id ?? ''
  const [roleToDrop, setRoleToDrop] = useState<Role | null>(null)
  const rolesQuery = useAccountRoles(account?.id ?? null)
  const dropMutation = useDropAccountRole(accountId)
  const dropForm = useForm<DropRoleValues>({
    resolver: zodResolver(dropRoleSchema),
    defaultValues: { reason: '' },
  })
  const roles = rolesQuery.data?.roles ?? []

  if (!account || !canManageRoles) {
    return null
  }

  const handleClose = () => {
    setRoleToDrop(null)
    dropForm.reset()
    dropMutation.reset()
    onClose()
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
        }
      }}
    >
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar tipos de acesso</DialogTitle>
          <DialogDescription>
            Altere os tipos de acesso associados a {account.displayName ?? 'esta conta'}.
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-3" aria-labelledby="account-edit-roles-title">
          <h3
            id="account-edit-roles-title"
            className="flex items-center gap-2 font-semibold"
          >
            <Shield aria-hidden="true" className="h-4 w-4" />
            Tipos de acesso atuais
          </h3>

          {rolesQuery.isLoading && <LoadingState className="min-h-32" />}
          {rolesQuery.isError && (
            <ErrorState
              className="min-h-32"
              onRetry={() => void rolesQuery.refetch()}
            />
          )}
          {!rolesQuery.isLoading && !rolesQuery.isError && roles.length === 0 && (
            <EmptyState
              className="min-h-32"
              title="Nenhum tipo de acesso disponível."
            />
          )}

          {!rolesQuery.isLoading && !rolesQuery.isError && roles.length > 0 && (
            <div className="space-y-2">
              {roles.map((role) => {
                const presentation = getRolePresentation(role)

                return (
                  <div className="rounded-lg border bg-background p-3" key={role.id}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{presentation.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {presentation.description}
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setRoleToDrop(role)
                          dropMutation.reset()
                          dropForm.reset()
                        }}
                        size="sm"
                        type="button"
                        variant="destructive"
                      >
                        <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                        Remover
                      </Button>
                    </div>

                    {roleToDrop?.id === role.id && (
                      <Form {...dropForm}>
                        <form
                          className="mt-3 space-y-3 border-t pt-3"
                          onSubmit={dropForm.handleSubmit(({ reason }) => {
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
                                <FormControl>
                                  <Textarea maxLength={2000} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {dropMutation.isError && (
                            <Alert variant="destructive">
                              <AlertTitle>
                                Não foi possível remover o tipo de acesso.
                              </AlertTitle>
                              <AlertDescription>
                                {getErrorMessage(dropMutation.error)}
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => {
                                setRoleToDrop(null)
                                dropForm.reset()
                              }}
                              size="sm"
                              type="button"
                              variant="ghost"
                            >
                              Cancelar
                            </Button>
                            <Button
                              disabled={dropMutation.isPending}
                              size="sm"
                              type="submit"
                              variant="destructive"
                            >
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
          )}
        </section>

        <DialogFooter>
          <Button onClick={handleClose} type="button" variant="outline">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
