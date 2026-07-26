import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

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
import { Textarea } from '@/components/ui/Textarea'
import { getErrorMessage } from '@/lib/http'

import { useDeleteOratoriano } from '../hooks/useOratorianos'
import {
  deleteOratorianoSchema,
  type DeleteOratorianoFormValues,
} from '../schemas/oratorianoSchemas'

type DeleteOratorianoDialogProps = {
  name: string
  onDeleted: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
  oratorianoId: string
}

export function DeleteOratorianoDialog({
  name,
  onDeleted,
  onOpenChange,
  open,
  oratorianoId,
}: DeleteOratorianoDialogProps) {
  const mutation = useDeleteOratoriano()
  const form = useForm<DeleteOratorianoFormValues>({
    defaultValues: { reason: '' },
    resolver: zodResolver(deleteOratorianoSchema),
  })
  const reason = useWatch({ control: form.control, name: 'reason' })
  const reasonLength = Array.from(reason).length

  const changeOpen = (nextOpen: boolean, force = false) => {
    if (!nextOpen && mutation.isPending && !force) {
      return
    }

    if (!nextOpen) {
      form.reset()
      mutation.reset()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => changeOpen(nextOpen)}
      open={open}
    >
      <DialogContent
        className="max-h-[calc(100vh-2rem)] overflow-y-auto"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          form.setFocus('reason')
        }}
      >
        <DialogHeader>
          <DialogTitle>Excluir cadastro de {name}?</DialogTitle>
          <DialogDescription>
            O cadastro deixará de aparecer nas consultas e nas novas marcações
            de presença.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-semibold text-foreground">
            Antes de confirmar:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>As presenças anteriores permanecerão no histórico.</li>
            <li>
              Rascunhos de fichas, PDFs e anexos serão excluídos em conjunto.
            </li>
            <li>
              Fichas concluídas, substituídas ou revogadas impedem a exclusão.
            </li>
            <li>O nome continuará reservado para evitar duplicidade.</li>
          </ul>
        </div>

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(({ reason: normalizedReason }) => {
              mutation.mutate(
                {
                  oratorianoId,
                  reason: normalizedReason,
                },
                {
                  onSuccess: () => {
                    changeOpen(false, true)
                    onDeleted()
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
                  <FormLabel>Motivo da exclusão</FormLabel>
                  <FormControl>
                    <Textarea
                      autoComplete="off"
                      placeholder="Descreva por que este cadastro deve ser excluído"
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

            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>
                  Não foi possível excluir o cadastro.
                </AlertTitle>
                <AlertDescription>
                  {getErrorMessage(mutation.error)}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                disabled={mutation.isPending}
                onClick={() => changeOpen(false)}
                type="button"
                variant="outline"
              >
                Voltar
              </Button>
              <Button
                disabled={mutation.isPending}
                type="submit"
                variant="destructive"
              >
                {mutation.isPending ? 'Excluindo...' : 'Excluir cadastro'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
