import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/lib/http'

import { useCreateLocation } from '../hooks/useLocations'
import { locationSchema, type LocationFormValues } from '../schemas/locationSchema'

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
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => { const parsed = locationSchema.parse(values); mutation.mutate({ name: parsed.name, street: parsed.street || undefined, city: parsed.city, state: parsed.state, postalCode: parsed.postalCode || undefined, countryCode: parsed.countryCode, latitude: parsed.latitude ? Number(parsed.latitude) : undefined, longitude: parsed.longitude ? Number(parsed.longitude) : undefined }, { onSuccess: (created) => created.id ? onCreated(created.id) : changeOpen(false) }) })}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="name" render={({ field }) => <FormItem className="sm:col-span-2"><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="street" render={({ field }) => <FormItem className="sm:col-span-2"><FormLabel>Endereço</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="city" render={({ field }) => <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="state" render={({ field }) => <FormItem><FormLabel>Estado</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="postalCode" render={({ field }) => <FormItem><FormLabel>CEP / código postal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="countryCode" render={({ field }) => <FormItem><FormLabel>País (ISO)</FormLabel><FormControl><Input maxLength={2} {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="latitude" render={({ field }) => <FormItem><FormLabel>Latitude (opcional)</FormLabel><FormControl><Input inputMode="decimal" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="longitude" render={({ field }) => <FormItem><FormLabel>Longitude (opcional)</FormLabel><FormControl><Input inputMode="decimal" {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>
            {mutation.isError && <Alert variant="destructive"><AlertTitle>Não foi possível criar o local.</AlertTitle><AlertDescription>{getErrorMessage(mutation.error)}</AlertDescription></Alert>}
            <DialogFooter><Button onClick={() => changeOpen(false)} type="button" variant="outline">Cancelar</Button><Button disabled={mutation.isPending} type="submit">{mutation.isPending ? 'Criando...' : 'Criar local'}</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
