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
import { getErrorMessage } from '@/lib/http'

import { useRegisterOratoriano } from '../hooks/useOratorianos'
import {
  registerOratorianoSchema,
  type RegisterOratorianoFormValues,
} from '../schemas/oratorianoSchemas'

type RegisterOratorianoDialogProps = {
  onOpenChange: (open: boolean) => void
  onRegistered: (oratorianoId: string) => void
  open: boolean
}

export function RegisterOratorianoDialog({
  onOpenChange,
  onRegistered,
  open,
}: RegisterOratorianoDialogProps) {
  const mutation = useRegisterOratoriano()
  const form = useForm<RegisterOratorianoFormValues>({
    defaultValues: { firstName: '', surname: '' },
    resolver: zodResolver(registerOratorianoSchema),
  })

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset()
      mutation.reset()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog onOpenChange={changeOpen} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Oratoriano</DialogTitle>
          <DialogDescription>
            O cadastro inicial precisa somente do nome completo. Nascimento e
            telefone podem ser incluídos depois.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-5"
            noValidate
            onSubmit={form.handleSubmit((values) =>
              mutation.mutate(values, {
                onSuccess: (oratoriano) => {
                  if (oratoriano.id) {
                    onRegistered(oratoriano.id)
                  } else {
                    changeOpen(false)
                  }
                },
              }),
            )}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem required>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="given-name"
                        maxLength={32}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem required>
                    <FormLabel>Sobrenome completo</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="family-name"
                        maxLength={64}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Nomes equivalentes por caixa, acentos e espaços não podem ser
              duplicados.
            </p>
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>
                  Não foi possível cadastrar o Oratoriano.
                </AlertTitle>
                <AlertDescription>
                  {getErrorMessage(mutation.error)}
                </AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button
                onClick={() => changeOpen(false)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button disabled={mutation.isPending} type="submit">
                {mutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
