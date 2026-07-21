import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { EmptyState, ErrorState, LoadingState } from '@/components/AsyncState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { getRolePresentation } from '@/features/account'
import { getErrorMessage } from '@/lib/http'

import type { Role } from '../api/accounts'
import { useAssignAccountRole, useSearchRoles } from '../hooks/useAccountAdministration'
import { assignRoleSchema, type AssignRoleValues } from '../schemas/accountRoleSchemas'

type AccountRoleAssignmentSectionProps = {
  accountId: string
  roles: Role[]
}

export function AccountRoleAssignmentSection({
  accountId,
  roles,
}: AccountRoleAssignmentSectionProps) {
  const [roleSearchInput, setRoleSearchInput] = useState('')
  const [roleSearchTerm, setRoleSearchTerm] = useState('')
  const [roleToAssign, setRoleToAssign] = useState<Role | null>(null)
  const assignMutation = useAssignAccountRole(accountId)
  const assignForm = useForm<AssignRoleValues>({
    resolver: zodResolver(assignRoleSchema),
    defaultValues: { roleId: '', reason: '' },
  })
  const roleSearchQuery = useSearchRoles(roleSearchTerm, Boolean(accountId))
  const roleSearchResults = roleSearchQuery.data ?? []
  const normalizedRoleSearchInput = roleSearchInput.trim()
  const isRoleSearchPending = normalizedRoleSearchInput !== roleSearchTerm
  const isRoleSearchLoading =
    Boolean(normalizedRoleSearchInput) &&
    (isRoleSearchPending || roleSearchQuery.isLoading)
  const canShowRoleResults =
    Boolean(roleSearchTerm) &&
    !isRoleSearchPending &&
    !roleSearchQuery.isLoading &&
    !roleSearchQuery.isError

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setRoleSearchTerm(normalizedRoleSearchInput)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [normalizedRoleSearchInput])

  return (
    <section className="space-y-3" aria-labelledby="account-add-role-title">
      <h3
        id="account-add-role-title"
        className="flex items-center gap-2 font-semibold"
      >
        <UserPlus aria-hidden="true" className="h-4 w-4" />
        Adicionar tipo de acesso
      </h3>

      <div>
        <Label htmlFor="account-role-search">Nome do tipo de acesso</Label>
        <Input
          id="account-role-search"
          onChange={(event) => {
            setRoleSearchInput(event.target.value)
            setRoleToAssign(null)
            assignForm.reset()
            assignMutation.reset()
          }}
          placeholder="Digite parte do nome"
          value={roleSearchInput}
        />
      </div>

      {!normalizedRoleSearchInput && (
        <p className="text-sm text-muted-foreground">
          Digite o nome para encontrar tipos de acesso disponíveis.
        </p>
      )}
      {isRoleSearchLoading && (
        <LoadingState className="min-h-24" title="Buscando tipos de acesso..." />
      )}
      {roleSearchTerm && !isRoleSearchPending && roleSearchQuery.isError && (
        <ErrorState
          className="min-h-24"
          onRetry={() => void roleSearchQuery.refetch()}
        />
      )}
      {canShowRoleResults && roleSearchResults.length === 0 && (
        <EmptyState
          className="min-h-24"
          title="Nenhum tipo de acesso encontrado."
          description="Tente buscar por outro nome."
        />
      )}
      {canShowRoleResults && roleSearchResults.length > 0 && (
        <div className="space-y-2" aria-label="Tipos de acesso encontrados">
          {roleSearchResults.map((role) => {
            const presentation = getRolePresentation(role)
            const isAssigned = roles.some((currentRole) => currentRole.id === role.id)

            return (
              <div className="rounded-lg border bg-background p-3" key={role.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{presentation.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {presentation.description}
                    </p>
                  </div>
                  {isAssigned ? (
                    <span className="text-sm text-muted-foreground">Já associado</span>
                  ) : (
                    <Button
                      onClick={() => {
                        setRoleToAssign(role)
                        assignMutation.reset()
                        assignForm.reset({ roleId: role.id, reason: '' })
                      }}
                      size="sm"
                      type="button"
                    >
                      Adicionar
                    </Button>
                  )}
                </div>

                {roleToAssign?.id === role.id && (
                  <Form {...assignForm}>
                    <form
                      className="mt-3 space-y-3 border-t pt-3"
                      onSubmit={assignForm.handleSubmit(({ roleId, reason }) => {
                        assignMutation.mutate(
                          { roleId, reason },
                          {
                            onSuccess: () => {
                              setRoleToAssign(null)
                              assignForm.reset()
                            },
                          },
                        )
                      })}
                    >
                      <FormField
                        control={assignForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Motivo da atribuição</FormLabel>
                            <FormControl>
                              <Textarea maxLength={2000} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {assignMutation.isError && (
                        <Alert variant="destructive">
                          <AlertTitle>
                            Não foi possível adicionar o tipo de acesso.
                          </AlertTitle>
                          <AlertDescription>
                            {getErrorMessage(assignMutation.error)}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => {
                            setRoleToAssign(null)
                            assignForm.reset()
                            assignMutation.reset()
                          }}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Cancelar
                        </Button>
                        <Button
                          disabled={assignMutation.isPending}
                          size="sm"
                          type="submit"
                        >
                          Confirmar atribuição
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
      {assignMutation.isSuccess && !roleToAssign && (
        <Alert>
          <AlertTitle>Tipo de acesso adicionado.</AlertTitle>
          <AlertDescription>
            A associação foi atualizada com sucesso.
          </AlertDescription>
        </Alert>
      )}
    </section>
  )
}
