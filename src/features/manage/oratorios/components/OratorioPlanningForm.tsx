import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
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

import type { OratorioPlanning } from '../api/oratorios'
import { useReplaceOratorioPlanning } from '../hooks/useOratorios'
import {
  oratorioPlanningSchema,
  type OratorioPlanningFormValues,
} from '../schemas/oratorioSchemas'

const planningFields = [
  {
    label: 'Lanche',
    name: 'lancheDescription',
  },
  {
    label: 'Gincana',
    name: 'gincanaDescription',
  },
  {
    label: 'Boa Tarde das Crianças',
    name: 'boaTardeCriancasPlan',
  },
  {
    label: 'Boa Tarde dos Jovens',
    name: 'boaTardeJovensPlan',
  },
] as const

export type OratorioPlanningFieldName =
  (typeof planningFields)[number]['name']

function toFormValues(
  planning?: OratorioPlanning | null,
): OratorioPlanningFormValues {
  return {
    boaTardeCriancasPlan: planning?.boaTardeCriancasPlan ?? '',
    boaTardeJovensPlan: planning?.boaTardeJovensPlan ?? '',
    gincanaDescription: planning?.gincanaDescription ?? '',
    lancheDescription: planning?.lancheDescription ?? '',
  }
}

type OratorioPlanningFormRenderProps = {
  renderField: (name: OratorioPlanningFieldName) => ReactNode
}

type OratorioPlanningFormProps = {
  canEdit: boolean
  children: (props: OratorioPlanningFormRenderProps) => ReactNode
  oratorioId: string
  planning?: OratorioPlanning | null
}

export function OratorioPlanningForm({
  canEdit,
  children,
  oratorioId,
  planning,
}: OratorioPlanningFormProps) {
  const mutation = useReplaceOratorioPlanning()
  const form = useForm<OratorioPlanningFormValues>({
    defaultValues: toFormValues(planning),
    resolver: zodResolver(oratorioPlanningSchema),
  })

  useEffect(() => {
    form.reset(toFormValues(planning))
  }, [form, planning])

  const renderField = (name: OratorioPlanningFieldName) => {
    const item = planningFields.find((field) => field.name === name)
    if (!item) return null

    return (
      <FormField
        control={form.control}
        key={name}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{item.label}</FormLabel>
            <FormControl>
              <Textarea
                className="min-h-28 resize-y"
                disabled={!canEdit}
                maxLength={10000}
                placeholder={
                  canEdit
                    ? 'Escreva o planejamento desta frente.'
                    : 'Nenhum planejamento informado.'
                }
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Programação</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) =>
              mutation.mutate({
                oratorioId,
                payload: values,
              }),
            )}
          >
            {children({ renderField })}

            {!canEdit && (
              <Alert>
                <AlertTitle>Planejamento em modo de leitura.</AlertTitle>
                <AlertDescription>
                  A situação ou as atribuições atuais não permitem alterações.
                </AlertDescription>
              </Alert>
            )}
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>
                  Não foi possível salvar o planejamento.
                </AlertTitle>
                <AlertDescription>
                  {getErrorMessage(mutation.error)}
                </AlertDescription>
              </Alert>
            )}
            {mutation.isSuccess && (
              <p
                aria-live="polite"
                className="text-sm font-medium text-primary"
              >
                Planejamento salvo.
              </p>
            )}
            {canEdit && (
              <Button disabled={mutation.isPending} type="submit">
                <Save aria-hidden="true" className="h-4 w-4" />
                {mutation.isPending
                  ? 'Salvando...'
                  : 'Salvar planejamento'}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
