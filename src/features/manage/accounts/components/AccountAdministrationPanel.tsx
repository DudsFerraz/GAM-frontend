import { zodResolver } from '@hookform/resolvers/zod'
import { Search, Shield, Trash2, UserCog } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { EmptyState, ErrorState, LoadingState } from '@/components/AsyncState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { getErrorMessage } from '@/lib/http'

import type { Account, Role } from '../api/accounts'
import { useAccountRoleAssignment, useAccountRoles, useAssignAccountRole, useDropAccountRole } from '../hooks/useAccountAdministration'
import { assignRoleSchema, assignmentLookupSchema, dropRoleSchema, type AssignmentLookupValues, type AssignRoleValues, type DropRoleValues } from '../schemas/accountRoleSchemas'
import { RbacInspector } from './RbacInspector'

type Props = { account: Account; canManageRoles: boolean; canInspectRbac: boolean }

export function AccountAdministrationPanel({ account, canManageRoles, canInspectRbac }: Props) {
  const accountId = account.id ?? ''
  const [roleToDrop, setRoleToDrop] = useState<Role | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [assignmentId, setAssignmentId] = useState<string | null>(null)
  const rolesQuery = useAccountRoles(account.id ?? null)
  const assignmentQuery = useAccountRoleAssignment(accountId, assignmentId)
  const assignMutation = useAssignAccountRole(accountId)
  const dropMutation = useDropAccountRole(accountId)
  const assignForm = useForm<AssignRoleValues>({ resolver: zodResolver(assignRoleSchema), defaultValues: { roleId: '', reason: '' } })
  const dropForm = useForm<DropRoleValues>({ resolver: zodResolver(dropRoleSchema), defaultValues: { reason: '' } })
  const lookupForm = useForm<AssignmentLookupValues>({ resolver: zodResolver(assignmentLookupSchema), defaultValues: { assignmentId: '' } })
  const roles = rolesQuery.data?.roles ?? []

  return (
    <div className="space-y-4">
      <Card className="gap-4 py-5">
        <CardHeader className="px-5"><p className="text-xs font-medium uppercase tracking-wide text-primary">Conta selecionada</p><CardTitle className="text-xl">{account.displayName ?? 'Conta sem nome'}</CardTitle><p className="text-sm text-muted-foreground">{account.email}</p><p className="break-all text-xs text-muted-foreground">{account.id}</p></CardHeader>
        <CardContent className="space-y-5 px-5">
          <section className="space-y-3" aria-labelledby="account-roles-title">
            <h3 id="account-roles-title" className="flex items-center gap-2 font-semibold"><Shield className="h-4 w-4" />Papéis ativos</h3>
            {rolesQuery.isLoading && <LoadingState className="min-h-32" />}
            {rolesQuery.isError && <ErrorState className="min-h-32" onRetry={() => void rolesQuery.refetch()} />}
            {!rolesQuery.isLoading && !rolesQuery.isError && roles.length === 0 && <EmptyState className="min-h-32" title="Nenhum papel ativo." />}
            <div className="space-y-2">
              {roles.map((role, index) => (
                <div className="rounded-lg border bg-background p-3" key={role.id ?? index}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="font-semibold">{role.name ?? 'Papel sem nome'}</p><p className="text-sm text-muted-foreground">{role.description ?? 'Sem descrição'}</p></div>
                    <div className="flex flex-wrap gap-2">
                      {role.id && canInspectRbac && <Button onClick={() => setSelectedRoleId(role.id ?? null)} size="sm" variant="outline">Inspecionar</Button>}
                      {role.id && canManageRoles && <Button onClick={() => { setRoleToDrop(role); dropMutation.reset(); dropForm.reset() }} size="sm" variant="destructive"><Trash2 className="h-3.5 w-3.5" />Remover</Button>}
                    </div>
                  </div>
                  {roleToDrop?.id === role.id && (
                    <Form {...dropForm}>
                      <form className="mt-3 space-y-3 border-t pt-3" onSubmit={dropForm.handleSubmit(({ reason }) => role.id && dropMutation.mutate({ roleId: role.id, reason }, { onSuccess: () => { setRoleToDrop(null); dropForm.reset() } }))}>
                        <FormField control={dropForm.control} name="reason" render={({ field }) => <FormItem><FormLabel>Motivo da remoção</FormLabel><FormControl><Textarea maxLength={2000} {...field} /></FormControl><FormMessage /></FormItem>} />
                        {dropMutation.isError && <Alert variant="destructive"><AlertTitle>Não foi possível remover o papel.</AlertTitle><AlertDescription>{getErrorMessage(dropMutation.error)}</AlertDescription></Alert>}
                        <div className="flex justify-end gap-2"><Button onClick={() => setRoleToDrop(null)} size="sm" type="button" variant="ghost">Cancelar</Button><Button disabled={dropMutation.isPending} size="sm" type="submit" variant="destructive">Confirmar remoção</Button></div>
                      </form>
                    </Form>
                  )}
                </div>
              ))}
            </div>
          </section>

          {canManageRoles && (
            <section className="space-y-3 border-t pt-5" aria-labelledby="assign-role-title">
              <h3 id="assign-role-title" className="flex items-center gap-2 font-semibold"><UserCog className="h-4 w-4" />Atribuir papel</h3>
              <Form {...assignForm}>
                <form className="space-y-3" onSubmit={assignForm.handleSubmit((values) => assignMutation.mutate(values, { onSuccess: (assignment) => { assignForm.reset(); if (assignment.id) { setAssignmentId(assignment.id); lookupForm.setValue('assignmentId', assignment.id) } } }))}>
                  <FormField control={assignForm.control} name="roleId" render={({ field }) => <FormItem><FormLabel>Identificador do papel</FormLabel><FormControl><Input placeholder="UUID do papel" {...field} /></FormControl><FormMessage /></FormItem>} />
                  <FormField control={assignForm.control} name="reason" render={({ field }) => <FormItem><FormLabel>Motivo da atribuição</FormLabel><FormControl><Textarea maxLength={2000} {...field} /></FormControl><FormMessage /></FormItem>} />
                  {assignMutation.isError && <Alert variant="destructive"><AlertTitle>Não foi possível atribuir o papel.</AlertTitle><AlertDescription>{getErrorMessage(assignMutation.error)}</AlertDescription></Alert>}
                  <Button disabled={assignMutation.isPending} type="submit">{assignMutation.isPending ? 'Atribuindo...' : 'Atribuir papel'}</Button>
                </form>
              </Form>
            </section>
          )}

          <section className="space-y-3 border-t pt-5" aria-labelledby="assignment-title">
            <h3 id="assignment-title" className="flex items-center gap-2 font-semibold"><Search className="h-4 w-4" />Consultar vínculo específico</h3>
            <Form {...lookupForm}>
              <form className="flex flex-col gap-2 sm:flex-row sm:items-start" onSubmit={lookupForm.handleSubmit(({ assignmentId: value }) => setAssignmentId(value))}>
                <FormField control={lookupForm.control} name="assignmentId" render={({ field }) => <FormItem className="flex-1"><FormLabel>Identificador do vínculo</FormLabel><FormControl><Input placeholder="UUID do vínculo conta-papel" {...field} /></FormControl><FormMessage /></FormItem>} />
                <Button className="sm:mt-6" type="submit" variant="outline">Consultar</Button>
              </form>
            </Form>
            {assignmentQuery.isLoading && <p className="text-sm text-muted-foreground">Consultando vínculo...</p>}
            {assignmentQuery.isError && <Alert variant="destructive"><AlertTitle>Vínculo não encontrado.</AlertTitle><AlertDescription>{getErrorMessage(assignmentQuery.error)}</AlertDescription></Alert>}
            {assignmentQuery.data && <div className="rounded-lg border bg-muted/30 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">Vínculo ativo</Badge><strong>{assignmentQuery.data.role?.name}</strong></div><p className="mt-2 break-all text-xs text-muted-foreground">{assignmentQuery.data.id}</p></div>}
          </section>
        </CardContent>
      </Card>
      {selectedRoleId && <RbacInspector canInspectPermissions={canInspectRbac} onClose={() => setSelectedRoleId(null)} roleId={selectedRoleId} />}
    </div>
  )
}
