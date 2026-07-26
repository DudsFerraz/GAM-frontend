import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  Form,
  FormControl,
  FormDescription,
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
    description: 'O que será servido e orientações para a preparação.',
    label: 'Lanche',
    name: 'lancheDescription',
  },
  {
    description: 'Dinâmica, materiais e organização da atividade.',
    label: 'Gincana',
    name: 'gincanaDescription',
  },
  {
    description: 'Tema e condução do Boa Tarde das Crianças.',
    label: 'Boa Tarde das Crianças',
    name: 'boaTardeCriancasPlan',
  },
  {
    description: 'Tema e condução do Boa Tarde dos Jovens.',
    label: 'Boa Tarde dos Jovens',
    name: 'boaTardeJovensPlan',
  },
] as const

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

type OratorioPlanningFormProps = {
  canEdit: boolean
  oratorioId: string
  planning?: OratorioPlanning | null
}

export function OratorioPlanningForm({
  canEdit,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planejamento</CardTitle>
        <p className="text-sm text-muted-foreground">
          Registre as orientações essenciais para as quatro frentes do dia.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit((values) =>
              mutation.mutate({
                oratorioId,
                payload: values,
              }),
            )}
          >
            <div className="grid gap-5 lg:grid-cols-2">
              {planningFields.map((item) => (
                <FormField
                  control={form.control}
                  key={item.name}
                  name={item.name}
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
                      <FormDescription>
                        {item.description}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            {!canEdit && (
              <Alert>
                <AlertTitle>Planejamento em modo de leitura.</AlertTitle>
                <AlertDescription>
                  A situação atual ou suas atribuições não permitem
                  alterações.
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
