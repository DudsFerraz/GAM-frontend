import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
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
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { getErrorMessage } from '@/lib/http'

import type { Oratoriano } from '../api/oratorianos'
import { canonicalizeNameSeparators } from '../name'
import { useReplaceOratoriano } from '../hooks/useOratorianos'
import {
  createReplaceOratorianoSchema,
  type ParsedReplaceOratorianoFormValues,
} from '../schemas/oratorianoSchemas'

type EditOratorianoDialogProps = {
  onOpenChange: (open: boolean) => void
  open: boolean
  oratoriano: Oratoriano
  oratorianoId: string
}

export function EditOratorianoDialog({
  onOpenChange,
  open,
  oratoriano,
  oratorianoId,
}: EditOratorianoDialogProps) {
  const mutation = useReplaceOratoriano()
  const schema = useMemo(
    () => createReplaceOratorianoSchema(oratoriano),
    [oratoriano],
  )
  const initialValues = useMemo(
    () => ({
      birthDate: oratoriano.birthDate ?? '',
      firstName: oratoriano.firstName ?? '',
      phoneNumber: oratoriano.phoneNumber ?? '',
      reason: '',
      surname: oratoriano.surname ?? '',
    }),
    [oratoriano],
  )
  const form = useForm<ParsedReplaceOratorianoFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(schema),
  })
  const { reset } = form
  const watchedFirstName = useWatch({
    control: form.control,
    name: 'firstName',
  })
  const watchedSurname = useWatch({
    control: form.control,
    name: 'surname',
  })
  const nameChanged =
    canonicalizeNameSeparators(watchedFirstName)
      !== canonicalizeNameSeparators(oratoriano.firstName ?? '')
    || canonicalizeNameSeparators(watchedSurname)
      !== canonicalizeNameSeparators(oratoriano.surname ?? '')

  useEffect(() => {
    if (!open) {
      reset(initialValues)
    }
  }, [initialValues, open, reset])

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen) {
      mutation.reset()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog onOpenChange={changeOpen} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar perfil do Oratoriano</DialogTitle>
          <DialogDescription>
            Revise o perfil comum. Uma correção de nome precisa de motivo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit((values) =>
              mutation.mutate(
                {
                  oratorianoId,
                  payload: {
                    birthDate: values.birthDate || undefined,
                    firstName: values.firstName,
                    phoneNumber: values.phoneNumber || undefined,
                    reason: values.reason || undefined,
                    surname: values.surname,
                  },
                },
                { onSuccess: () => changeOpen(false) },
              ),
            )}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="given-name"
                        maxLength={32}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome completo</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="family-name"
                        maxLength={64}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="tel"
                        inputMode="tel"
                        maxLength={32}
                        placeholder="+55 19 99999-9999"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Aceita número brasileiro ou internacional com DDI.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {nameChanged && (
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Motivo da correção do nome</FormLabel>
                      <FormControl>
                        <Textarea maxLength={2000} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>
                  Não foi possível atualizar o perfil.
                </AlertTitle>
                <AlertDescription>
                  {getErrorMessage(mutation.error)}
                </AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button
                onClick={() => changeOpen(false)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button disabled={mutation.isPending} type="submit">
                {mutation.isPending ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
