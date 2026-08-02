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
  DialogTrigger,
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

import { isConflictError } from '../hooks/useOratorianoForms'
import {
  oratorianoFormReasonSchema,
  type OratorianoFormReasonValues,
} from '../schemas/reasonSchema'
import type { OratorianoFormReason } from '../types'

type DeleteOratorianoFormDialogProps = {
  canOpen: boolean
  error: unknown
  isPending: boolean
  name: string
  onDelete: (payload: OratorianoFormReason) => void
  onOpenChange: (open: boolean) => void
  onReset: () => void
  open: boolean
}

export function DeleteOratorianoFormDialog({
  canOpen,
  error,
  isPending,
  name,
  onDelete,
  onOpenChange,
  onReset,
  open,
}: DeleteOratorianoFormDialogProps) {
  const form = useForm<OratorianoFormReasonValues>({
    defaultValues: { reason: '' },
    resolver: zodResolver(oratorianoFormReasonSchema),
  })
  const reason = useWatch({ control: form.control, name: 'reason' }) ?? ''
  const reasonLength = Array.from(reason).length
  const hasError = error !== null && error !== undefined

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return

    if (!nextOpen) {
      form.reset()
      onReset()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog
      onOpenChange={changeOpen}
      open={open}
    >
      {canOpen && (
        <DialogTrigger asChild>
          <Button
            disabled={isPending}
            type="button"
            variant="destructive"
          >
            Excluir rascunho
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        className="max-h-[calc(100vh-2rem)] overflow-y-auto"
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault()
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          form.setFocus('reason')
        }}
        onPointerDownOutside={(event) => {
          if (isPending) event.preventDefault()
        }}
        showCloseButton={!isPending}
      >
        <DialogHeader>
          <DialogTitle>Excluir rascunho de {name}?</DialogTitle>
          <DialogDescription>
            O rascunho deixará de ficar disponível. PDFs e anexos associados
            também deixarão de ter acesso ordinário.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-semibold text-foreground">
            Antes de confirmar:
          </p>
          <p className="mt-2 text-muted-foreground">
            Informe um motivo para registrar esta decisão. O editor e as
            alterações locais permanecem preservados se a operação falhar.
          </p>
        </div>

        <Form {...form}>
          <form
            className="space-y-4"
            noValidate
            onSubmit={form.handleSubmit(({ reason: normalizedReason }) => {
              onDelete({ reason: normalizedReason })
            })}
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem required>
                  <FormLabel>Motivo da exclusão</FormLabel>
                  <FormControl>
                    <Textarea
                      autoComplete="off"
                      placeholder="Descreva por que este rascunho deve ser excluído"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription aria-live="polite">
                    {reasonLength.toLocaleString('pt-BR')} de 2.000 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasError && (
              <Alert variant="destructive">
                <AlertTitle>
                  Não foi possível excluir o rascunho.
                </AlertTitle>
                <AlertDescription>
                  {isConflictError(error)
                    ? 'A situação da ficha mudou ou não está mais disponível. Atualizamos os dados disponíveis; confira a ficha antes de tentar novamente.'
                    : getErrorMessage(error)}
                </AlertDescription>
              </Alert>
            )}

            {isPending && (
              <p aria-live="polite" className="text-sm text-muted-foreground" role="status">
                Confirmando a exclusão do rascunho…
              </p>
            )}

            <DialogFooter>
              <Button
                disabled={isPending}
                onClick={() => changeOpen(false)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                disabled={isPending}
                type="submit"
                variant="destructive"
              >
                {isPending ? 'Excluindo rascunho…' : 'Excluir rascunho'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
