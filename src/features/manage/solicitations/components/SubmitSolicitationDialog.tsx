import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { getErrorMessage } from '@/lib/http'

import { useSubmitSolicitation } from '../hooks/useSolicitations'
import { solicitationSchema, type SolicitationFormValues } from '../schemas/solicitationSchemas'

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

export function SubmitSolicitationDialog({ open, onOpenChange }: Props) {
  const mutation = useSubmitSolicitation()
  const form = useForm<SolicitationFormValues>({
    resolver: zodResolver(solicitationSchema),
    defaultValues: { firstName: '', surname: '', birthDate: '', phoneNumber: '', justification: '' },
  })

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen) { form.reset(); mutation.reset() }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova solicitação de membresia</DialogTitle>
          <DialogDescription>Envie seus dados para análise da coordenação. O envio não concede membresia automaticamente.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values, { onSuccess: () => changeOpen(false) }))}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="firstName" render={({ field }) => <FormItem><FormLabel>Nome</FormLabel><FormControl><Input autoComplete="given-name" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="surname" render={({ field }) => <FormItem><FormLabel>Sobrenome</FormLabel><FormControl><Input autoComplete="family-name" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="birthDate" render={({ field }) => <FormItem><FormLabel>Data de nascimento</FormLabel><FormControl><Input max={new Date().toISOString().slice(0, 10)} type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="phoneNumber" render={({ field }) => <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input autoComplete="tel" placeholder="+5519999999999" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="justification" render={({ field }) => <FormItem className="sm:col-span-2"><FormLabel>Por que deseja participar?</FormLabel><FormControl><Textarea maxLength={2000} {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>
            {mutation.isError && <Alert variant="destructive"><AlertTitle>Não foi possível enviar a solicitação.</AlertTitle><AlertDescription>{getErrorMessage(mutation.error)}</AlertDescription></Alert>}
            <DialogFooter><Button onClick={() => changeOpen(false)} type="button" variant="outline">Cancelar</Button><Button disabled={mutation.isPending} type="submit">{mutation.isPending ? 'Enviando...' : 'Enviar solicitação'}</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
