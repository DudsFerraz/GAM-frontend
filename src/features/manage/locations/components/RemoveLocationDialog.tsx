import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Textarea } from '@/components/ui/Textarea'
import { getErrorMessage } from '@/lib/http'

import type { Location } from '../api/locations'
import { useRemoveLocation } from '../hooks/useLocations'
import { removeLocationSchema, type RemoveLocationFormValues } from '../schemas/locationSchema'

type RemoveLocationDialogProps = {
  location: Location
  onOpenChange: (open: boolean) => void
  onRemoved: () => void
  open: boolean
}

export function RemoveLocationDialog({ location, onOpenChange, onRemoved, open }: RemoveLocationDialogProps) {
  const mutation = useRemoveLocation()
  const form = useForm<RemoveLocationFormValues>({ resolver: zodResolver(removeLocationSchema), defaultValues: { reason: '' } })

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset()
      mutation.reset()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent>
        <DialogHeader><DialogTitle>Remover local</DialogTitle><DialogDescription>Esta ação remove o local do uso futuro. Locais associados a eventos não podem ser removidos.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(({ reason }) => mutation.mutate({ locationId: location.id, reason }, { onSuccess: () => { changeOpen(false); onRemoved() } }))}>
            <FormField control={form.control} name="reason" render={({ field }) => <FormItem><FormLabel>Motivo da remoção</FormLabel><FormControl><Textarea maxLength={2000} placeholder="Descreva o motivo da remoção" {...field} /></FormControl><FormMessage /></FormItem>} />
            {mutation.isError && <Alert variant="destructive"><AlertTitle>Não foi possível remover o local.</AlertTitle><AlertDescription>{getErrorMessage(mutation.error)}</AlertDescription></Alert>}
            <DialogFooter><Button onClick={() => changeOpen(false)} type="button" variant="outline">Cancelar</Button><Button disabled={mutation.isPending} type="submit" variant="destructive">{mutation.isPending ? 'Removendo...' : 'Confirmar remoção'}</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
