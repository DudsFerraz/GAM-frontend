import type { UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'

import type { LocationFormValues } from '../schemas/locationSchema'

type LocationFormFieldsProps = {
  form: UseFormReturn<LocationFormValues>
}

export function LocationFormFields({ form }: LocationFormFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField control={form.control} name="name" render={({ field }) => <FormItem className="sm:col-span-2"><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
      <FormField control={form.control} name="street" render={({ field }) => <FormItem className="sm:col-span-2"><FormLabel>Endereço</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
      <FormField control={form.control} name="city" render={({ field }) => <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
      <FormField control={form.control} name="state" render={({ field }) => <FormItem><FormLabel>Estado</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
      <FormField control={form.control} name="postalCode" render={({ field }) => <FormItem><FormLabel>CEP / código postal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
      <div className="grid gap-2"><p className="text-sm text-muted-foreground">País</p><p className="flex h-10 items-center rounded-md border bg-muted/30 px-3 text-sm">Brasil</p></div>
      <input type="hidden" {...form.register('countryCode')} />
      <FormField control={form.control} name="latitude" render={({ field }) => <FormItem><FormLabel>Latitude (opcional)</FormLabel><FormControl><Input inputMode="decimal" {...field} /></FormControl><FormMessage /></FormItem>} />
      <FormField control={form.control} name="longitude" render={({ field }) => <FormItem><FormLabel>Longitude (opcional)</FormLabel><FormControl><Input inputMode="decimal" {...field} /></FormControl><FormMessage /></FormItem>} />
    </div>
  )
}
