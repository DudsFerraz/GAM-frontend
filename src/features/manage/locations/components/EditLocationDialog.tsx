import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Form } from '@/components/ui/Form'
import { getErrorMessage } from '@/lib/http'

import type { Location } from '../api/locations'
import { useUpdateLocation } from '../hooks/useLocations'
import { locationSchema, toLocationMutationPayload, type LocationFormValues } from '../schemas/locationSchema'
import { LocationFormFields } from './LocationFormFields'

type EditLocationDialogProps = {
  location: Location
  onOpenChange: (open: boolean) => void
  open: boolean
}

function getDefaultValues(location: Location): LocationFormValues {
  return {
    name: location.name,
    street: location.street ?? '',
    city: location.city,
    state: location.state,
    postalCode: location.postalCode ?? '',
    countryCode: location.countryCode,
    latitude: location.latitude?.toString() ?? '',
    longitude: location.longitude?.toString() ?? '',
  }
}

export function EditLocationDialog({ location, onOpenChange, open }: EditLocationDialogProps) {
  const mutation = useUpdateLocation()
  const { reset: resetMutation } = mutation
  const form = useForm<LocationFormValues>({ resolver: zodResolver(locationSchema), defaultValues: getDefaultValues(location) })

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(location))
      resetMutation()
    }
  }, [form, location, open, resetMutation])

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset(getDefaultValues(location))
      resetMutation()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>Editar local</DialogTitle><DialogDescription>Atualize os dados compartilhados deste local.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate({ locationId: location.id, payload: toLocationMutationPayload(values) }, { onSuccess: () => changeOpen(false) }))}>
            <LocationFormFields form={form} />
            {mutation.isError && <Alert variant="destructive"><AlertTitle>Não foi possível atualizar o local.</AlertTitle><AlertDescription>{getErrorMessage(mutation.error)}</AlertDescription></Alert>}
            <DialogFooter><Button onClick={() => changeOpen(false)} type="button" variant="outline">Cancelar</Button><Button disabled={mutation.isPending} type="submit">{mutation.isPending ? 'Salvando...' : 'Salvar alterações'}</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
