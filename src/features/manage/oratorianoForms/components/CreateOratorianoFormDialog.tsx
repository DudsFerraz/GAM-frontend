import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ClipboardPenLine, FileInput } from 'lucide-react'
import { useRef, type FormEvent } from 'react'
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
import { Form, FormField, FormItem, FormLegend, FormMessage } from '@/components/ui/Form'
import { getErrorMessage } from '@/lib/http'
import { cn } from '@/lib/utils'

import { useCreateOratorianoForm } from '../hooks/useOratorianoForms'
import {
  createOratorianoFormSchema,
  type CreateOratorianoFormValues,
} from '../schemas/createFormSchema'

type CreateOratorianoFormDialogProps = {
  onOpenChange: (open: boolean) => void
  open: boolean
  oratorianoId: string
}

const ORIGIN_OPTIONS = [
  {
    description: 'Use quando as informações já foram preenchidas em uma ficha física e serão transcritas.',
    icon: FileInput,
    label: 'Transcrição de formulário em papel',
    value: 'PAPER_TRANSCRIPTION',
  },
  {
    description: 'Use quando o preenchimento será feito diretamente nesta ficha digital.',
    icon: ClipboardPenLine,
    label: 'Preenchimento direto no sistema',
    value: 'DIRECT_SYSTEM_ENTRY',
  },
] as const

export function CreateOratorianoFormDialog({
  onOpenChange,
  open,
  oratorianoId,
}: CreateOratorianoFormDialogProps) {
  const navigate = useNavigate()
  const submissionLockRef = useRef(false)
  const mutation = useCreateOratorianoForm(oratorianoId)
  const form = useForm<CreateOratorianoFormValues>({
    defaultValues: {},
    resolver: zodResolver(createOratorianoFormSchema),
  })

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen && !mutation.isPending) {
      form.reset()
      mutation.reset()
    }
    if (!mutation.isPending || nextOpen) onOpenChange(nextOpen)
  }

  const submitValid = (values: CreateOratorianoFormValues) => {
    if (mutation.isPending || submissionLockRef.current) return
    submissionLockRef.current = true
    mutation.mutate(values.origin, {
      onSettled: () => {
        submissionLockRef.current = false
      },
      onSuccess: (detail) => {
        if (!detail.id) return
        onOpenChange(false)
        void navigate({
          params: { formId: detail.id, oratorianoId },
          to: '/manage/oratorios/oratorianos/$oratorianoId/fichas/$formId',
        })
      },
    })
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    void form.handleSubmit(submitValid)(event)
  }

  return (
    <Dialog onOpenChange={changeOpen} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova ficha adicional</DialogTitle>
          <DialogDescription>
            Escolha a origem das informações. A ficha será criada como
            rascunho e poderá ser preenchida em etapas.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-5" noValidate onSubmit={submit}>
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem required>
                  <fieldset aria-required="true" className="space-y-3">
                    <FormLegend className="text-sm font-semibold">
                      Como esta ficha será preenchida?
                    </FormLegend>
                    {ORIGIN_OPTIONS.map((option) => {
                      const Icon = option.icon
                      const selected = field.value === option.value
                      return (
                        <label
                          className={cn(
                            'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                            'focus-within:ring-2 focus-within:ring-ring',
                            selected
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50',
                          )}
                          key={option.value}
                        >
                          <input
                            checked={selected}
                            className="mt-1 h-4 w-4 accent-primary"
                            disabled={mutation.isPending}
                            name={field.name}
                            onBlur={field.onBlur}
                            onChange={() => field.onChange(option.value)}
                            ref={field.ref}
                            required
                            type="radio"
                            value={option.value}
                          />
                          <Icon
                            aria-hidden="true"
                            className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                          />
                          <span>
                            <span className="block font-medium">
                              {option.label}
                            </span>
                            <span className="mt-1 block text-sm text-muted-foreground">
                              {option.description}
                            </span>
                          </span>
                        </label>
                      )
                    })}
                  </fieldset>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>Não foi possível criar a ficha.</AlertTitle>
                <AlertDescription>
                  {getErrorMessage(mutation.error)} A escolha foi mantida para
                  você tentar novamente.
                </AlertDescription>
              </Alert>
            )}

            {mutation.isSuccess && !mutation.data.id && (
              <Alert variant="destructive">
                <AlertTitle>A ficha foi criada, mas não pôde ser aberta.</AlertTitle>
                <AlertDescription>
                  Volte ao histórico e tente abrir a nova versão.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                disabled={mutation.isPending}
                onClick={() => changeOpen(false)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button disabled={mutation.isPending} type="submit">
                {mutation.isPending ? 'Criando rascunho…' : 'Criar rascunho'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
