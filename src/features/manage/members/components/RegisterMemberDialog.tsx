import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { EmptyState, ErrorState, LoadingState } from '@/components/AsyncState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useSearchAccounts, type Account } from '@/features/manage/accounts'
import { getErrorMessage } from '@/lib/http'

import { useCreateMember } from '../hooks/useCreateMember'
import {
  registerMemberSchema,
  type RegisterMemberFormValues,
} from '../schemas/registerMemberSchema'

type RegisterMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (memberId: string) => void
}

export function RegisterMemberDialog({
  open,
  onOpenChange,
  onCreated,
}: RegisterMemberDialogProps) {
  const mutation = useCreateMember()
  const [accountSearch, setAccountSearch] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const accountsQuery = useSearchAccounts(accountSearch, 'displayName', 0, open)
  const form = useForm<RegisterMemberFormValues>({
    resolver: zodResolver(registerMemberSchema),
    defaultValues: {
      accountId: '',
      firstName: '',
      surname: '',
      birthDate: '',
      phoneNumber: '',
      reason: '',
    },
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset()
      mutation.reset()
      setAccountSearch('')
      setSelectedAccount(null)
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = (values: RegisterMemberFormValues) => {
    mutation.mutate(values, {
      onSuccess: (member) => {
        if (member.id) {
          onCreated(member.id)
        } else {
          handleOpenChange(false)
        }
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cadastrar membro diretamente</DialogTitle>
          <DialogDescription>
            Vincule uma conta existente a um novo membro ativo. Esta ação exige uma justificativa.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Conta</FormLabel>
                    <FormControl>
                      <div className="space-y-3 rounded-lg border p-3">
                        <Input
                          onChange={(event) => setAccountSearch(event.target.value)}
                          placeholder="Busque a conta pelo nome"
                          type="search"
                          value={accountSearch}
                        />
                        {selectedAccount && (
                          <div className="rounded-md border border-primary/40 bg-primary/5 p-3 text-sm">
                            <p className="font-medium">{selectedAccount.displayName ?? 'Conta sem nome'}</p>
                            <p className="text-muted-foreground">{selectedAccount.email}</p>
                          </div>
                        )}
                        {accountsQuery.isLoading && (
                          <LoadingState className="min-h-28" title="Buscando contas..." />
                        )}
                        {accountsQuery.isError && (
                          <ErrorState
                            className="min-h-28"
                            description="Não foi possível buscar as contas."
                            onRetry={() => void accountsQuery.refetch()}
                          />
                        )}
                        {!accountsQuery.isLoading && !accountsQuery.isError && accountsQuery.data?.items?.length === 0 && (
                          <EmptyState className="min-h-28" title="Nenhuma conta encontrada." />
                        )}
                        {!accountsQuery.isLoading && !accountsQuery.isError && (
                          <div className="max-h-48 space-y-2 overflow-y-auto" aria-label="Contas encontradas">
                            {accountsQuery.data?.items?.flatMap((account) => {
                              if (!account.id) return []

                              const isSelected = field.value === account.id

                              return [
                                <button
                                  aria-pressed={isSelected}
                                  className={isSelected
                                    ? 'w-full rounded-md border border-primary bg-primary/10 p-3 text-left text-sm'
                                    : 'w-full rounded-md border p-3 text-left text-sm transition-colors hover:border-primary/50 hover:bg-muted/40'}
                                  key={account.id}
                                  onClick={() => {
                                    field.onChange(account.id)
                                    setSelectedAccount(account)
                                  }}
                                  type="button"
                                >
                                  <span className="block font-medium">{account.displayName ?? 'Conta sem nome'}</span>
                                  <span className="block text-muted-foreground">{account.email}</span>
                                </button>,
                              ]
                            })}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl><Input autoComplete="given-name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl><Input autoComplete="family-name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de nascimento</FormLabel>
                    <FormControl><Input max={new Date().toISOString().slice(0, 10)} type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl><Input autoComplete="tel" placeholder="+5519999999999" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Motivo do cadastro</FormLabel>
                    <FormControl><Textarea maxLength={2000} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>Não foi possível cadastrar o membro.</AlertTitle>
                <AlertDescription>{getErrorMessage(mutation.error)}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)} type="button" variant="outline">
                Cancelar
              </Button>
              <Button disabled={mutation.isPending} type="submit">
                {mutation.isPending ? 'Cadastrando...' : 'Cadastrar membro'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
