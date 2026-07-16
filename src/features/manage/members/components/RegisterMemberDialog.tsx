import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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
                    <FormLabel>Identificador da conta</FormLabel>
                    <FormControl><Input placeholder="UUID da conta" {...field} /></FormControl>
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
