import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Form } from '@/components/ui/Form'
import { getErrorMessage } from '@/lib/http'

import { useCreateLocation } from '../hooks/useLocations'
import { locationSchema, toLocationMutationPayload, type LocationFormValues } from '../schemas/locationSchema'
import { LocationFormFields } from './LocationFormFields'

type Props = { open: boolean; onOpenChange: (open: boolean) => void; onCreated: (locationId: string) => void }

export function CreateLocationDialog({ open, onOpenChange, onCreated }: Props) {
  const mutation = useCreateLocation()
  const form = useForm<LocationFormValues>({ resolver: zodResolver(locationSchema), defaultValues: { name: '', street: '', city: '', state: '', postalCode: '', countryCode: 'BR', latitude: '', longitude: '' } })
  const changeOpen = (nextOpen: boolean) => { if (!nextOpen) { form.reset(); mutation.reset() }; onOpenChange(nextOpen) }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>Novo local</DialogTitle><DialogDescription>Cadastre um local que poderá ser associado a eventos.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(toLocationMutationPayload(values), { onSuccess: (created) => created.id ? onCreated(created.id) : changeOpen(false) }))}>
            <LocationFormFields form={form} />
            {mutation.isError && <Alert variant="destructive"><AlertTitle>Não foi possível criar o local.</AlertTitle><AlertDescription>{getErrorMessage(mutation.error)}</AlertDescription></Alert>}
            <DialogFooter><Button onClick={() => changeOpen(false)} type="button" variant="outline">Cancelar</Button><Button disabled={mutation.isPending} type="submit">{mutation.isPending ? 'Criando...' : 'Criar local'}</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
