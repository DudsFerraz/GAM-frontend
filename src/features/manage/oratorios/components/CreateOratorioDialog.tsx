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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/lib/http'

import { useCreateOratorio } from '../hooks/useOratorios'
import {
  createOratorioSchema,
  type CreateOratorioFormValues,
} from '../schemas/oratorioSchemas'

type CreateOratorioDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (oratorioId: string) => void
}

export function CreateOratorioDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateOratorioDialogProps) {
  const mutation = useCreateOratorio()
  const form = useForm<CreateOratorioFormValues>({
    defaultValues: { date: '' },
    resolver: zodResolver(createOratorioSchema),
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
          <DialogTitle>Novo Oratório</DialogTitle>
          <DialogDescription>
            Informe a data. Horário, local e programação serão definidos
            automaticamente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit((values) =>
              mutation.mutate(values, {
                onSuccess: (created) => {
                  if (created.id) {
                    onCreated(created.id)
                  } else {
                    changeOpen(false)
                  }
                },
              }),
            )}
          >
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do Oratório</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    A ocorrência acontecerá das 14h às 17h.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>
                  Não foi possível criar o Oratório.
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
                {mutation.isPending ? 'Criando...' : 'Criar Oratório'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
