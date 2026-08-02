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
import { Textarea } from '@/components/ui/Textarea'

import {
  oratorioReasonSchema,
  type OratorioReasonFormValues,
} from '../schemas/oratorioSchemas'

type AttendanceRemovalDialogProps = {
  errorMessage: string | null
  isPending: boolean
  name: string
  open: boolean
  onConfirm: (reason: string) => Promise<boolean>
  onOpenChange: (open: boolean) => void
}

export function AttendanceRemovalDialog({
  errorMessage,
  isPending,
  name,
  open,
  onConfirm,
  onOpenChange,
}: AttendanceRemovalDialogProps) {
  const form = useForm<OratorioReasonFormValues>({
    defaultValues: { reason: '' },
    resolver: zodResolver(oratorioReasonSchema),
  })

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen) form.reset()
    onOpenChange(nextOpen)
  }

  return (
    <Dialog onOpenChange={changeOpen} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover presença</DialogTitle>
          <DialogDescription>
            Informe por que a presença de {name} precisa ser corrigida.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            noValidate
            onSubmit={form.handleSubmit(async ({ reason }) => {
              const removed = await onConfirm(reason)
              if (removed) changeOpen(false)
            })}
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem required>
                  <FormLabel>Motivo da remoção</FormLabel>
                  <FormControl>
                    <Textarea maxLength={2000} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {errorMessage && (
              <Alert variant="destructive">
                <AlertTitle>
                  Não foi possível remover a presença.
                </AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button
                onClick={() => changeOpen(false)}
                type="button"
                variant="outline"
              >
                Voltar
              </Button>
              <Button
                disabled={isPending}
                type="submit"
                variant="destructive"
              >
                {isPending ? 'Removendo...' : 'Remover presença'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
