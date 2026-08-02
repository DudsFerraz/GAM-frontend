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
import { getErrorMessage } from '@/lib/http'

import type { Presence } from '../api/events'
import { useUpdateEventPresenceObservations } from '../hooks/useEvents'
import {
  updatePresenceObservationsSchema,
  type UpdatePresenceObservationsFormValues,
} from '../schemas/presenceSchemas'

type EditPresenceDialogProps = {
  eventId: string
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
  open: boolean
  presence: Presence
}

export function EditPresenceDialog({
  eventId,
  onOpenChange,
  onUpdated,
  open,
  presence,
}: EditPresenceDialogProps) {
  const mutation = useUpdateEventPresenceObservations()
  const form = useForm<UpdatePresenceObservationsFormValues>({
    resolver: zodResolver(updatePresenceObservationsSchema),
    defaultValues: { observations: presence.observations ?? '' },
  })
  const memberName = [presence.member.firstName, presence.member.surname].join(' ')

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen) mutation.reset()
    onOpenChange(nextOpen)
  }

  return (
    <Dialog onOpenChange={changeOpen} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar observações da presença</DialogTitle>
          <DialogDescription>
            Atualize somente a observação operacional de {memberName}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            noValidate
            onSubmit={form.handleSubmit(({ observations }) => mutation.mutate(
              {
                eventId,
                memberId: presence.member.id,
                observations: observations || null,
              },
              {
                onSuccess: () => {
                  changeOpen(false)
                  onUpdated()
                },
              },
            ))}
          >
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl><Textarea maxLength={2000} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>Não foi possível editar a presença.</AlertTitle>
                <AlertDescription>{getErrorMessage(mutation.error)}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button onClick={() => changeOpen(false)} type="button" variant="outline">
                Cancelar
              </Button>
              <Button disabled={mutation.isPending} type="submit">
                {mutation.isPending ? 'Salvando...' : 'Salvar observações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
