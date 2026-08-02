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
import { useRemoveEventPresence } from '../hooks/useEvents'
import {
  removePresenceSchema,
  type RemovePresenceFormValues,
} from '../schemas/presenceSchemas'

type RemovePresenceDialogProps = {
  eventId: string
  onOpenChange: (open: boolean) => void
  onRemoved: () => void
  open: boolean
  presence: Presence
}

export function RemovePresenceDialog({
  eventId,
  onOpenChange,
  onRemoved,
  open,
  presence,
}: RemovePresenceDialogProps) {
  const mutation = useRemoveEventPresence()
  const form = useForm<RemovePresenceFormValues>({
    resolver: zodResolver(removePresenceSchema),
    defaultValues: { reason: '' },
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
          <DialogTitle>Remover presença</DialogTitle>
          <DialogDescription>
            Remova a presença de {memberName} somente quando o registro estiver incorreto.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            noValidate
            onSubmit={form.handleSubmit(({ reason }) => mutation.mutate(
              {
                eventId,
                memberId: presence.member.id,
                reason,
              },
              {
                onSuccess: () => {
                  changeOpen(false)
                  onRemoved()
                },
              },
            ))}
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem required>
                  <FormLabel>Motivo da remoção</FormLabel>
                  <FormControl><Textarea maxLength={2000} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>Não foi possível remover a presença.</AlertTitle>
                <AlertDescription>{getErrorMessage(mutation.error)}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button onClick={() => changeOpen(false)} type="button" variant="outline">
                Cancelar
              </Button>
              <Button disabled={mutation.isPending} type="submit" variant="destructive">
                {mutation.isPending ? 'Removendo...' : 'Remover presença'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
