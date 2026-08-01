import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Circle, Save } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useForm,
  type FieldErrors,
  type FieldPath,
} from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Form } from '@/components/ui/Form'
import { getErrorMessage } from '@/lib/http'
import { cn } from '@/lib/utils'

import { fromFormDraftTransport, toFormDraftTransport } from '../formDraftMapper'
import {
  isConflictError,
  useDeleteOratorianoFormDraft,
  useReplaceOratorianoFormDraft,
} from '../hooks/useOratorianoForms'
import type { ParsedOratorianoFormDetail } from '../parseFormDetail'
import {
  getOratorianoFormOriginLabel,
  getOratorianoFormStatusPresentation,
} from '../presentation'
import {
  oratorianoFormEditorSchema,
  type OratorianoFormValues,
} from '../schemas/formDraftSchema'
import {
  DeclarationsStep,
  FamilyStep,
  HealthStep,
  IdentificationStep,
  ReviewStep,
} from './OratorianoFormStepFields'
import { DeleteOratorianoFormDialog } from './DeleteOratorianoFormDialog'
import { FormPrintSection } from './FormPrintSection'

const STEPS = [
  {
    description: 'Dados pessoais e localização.',
    fields: [
      'firstName', 'surname', 'birthDate', 'cpf', 'rg', 'phoneNumber',
      'address.addressLine', 'address.addressNumber', 'address.neighborhood',
      'address.cep', 'address.city',
    ],
    title: 'Identificação e endereço',
  },
  {
    description: 'Escola, pessoa responsável e vínculos familiares.',
    fields: [
      'schoolName', 'schoolGrade', 'responsible.relationship',
      'responsible.relationshipComplement', 'responsible.firstName',
      'responsible.surname', 'responsible.cpf', 'responsible.phoneNumber',
      'responsible.email', 'responsible.atLeast18', 'father.firstName',
      'father.surname', 'father.cpf', 'mother.firstName', 'mother.surname',
      'mother.cpf',
    ],
    title: 'Escola, responsável e família',
  },
  {
    description: 'Respostas e orientações importantes para o cuidado.',
    fields: [
      'health.medicalFollowUp.answer', 'health.medicalFollowUp.explanation',
      'health.medicalFollowUp.importantInstructions',
      'health.physicalActivityRestriction.answer',
      'health.physicalActivityRestriction.explanation',
      'health.physicalActivityRestriction.importantInstructions',
      'health.medicineUse.answer', 'health.medicineUse.explanation',
      'health.medicineUse.importantInstructions', 'health.allergies.answer',
      'health.allergies.explanation', 'health.allergies.importantInstructions',
      'health.convulsions.answer', 'health.convulsions.explanation',
      'health.convulsions.importantInstructions',
      'health.frequentFainting.answer', 'health.frequentFainting.explanation',
      'health.frequentFainting.importantInstructions',
      'health.heartCondition.answer', 'health.heartCondition.explanation',
      'health.heartCondition.importantInstructions',
      'health.otherHealthCondition.answer',
      'health.otherHealthCondition.explanation',
      'health.otherHealthCondition.importantInstructions', 'health.otherCare',
    ],
    title: 'Informações de saúde',
  },
  {
    description: 'Confirmações e data da assinatura.',
    fields: [
      'declarations.signerRelationshipConfirmed',
      'declarations.informationTruthConfirmed',
      'declarations.healthInformationCurrentConfirmed',
      'declarations.informationUseUnderstood',
      'declarations.formReviewed',
      'declarations.imageAndVoiceAuthorizationAccepted',
      'signedOn',
    ],
    title: 'Declarações e assinatura',
  },
  {
    description: 'Confira o preenchimento antes de salvar.',
    fields: [],
    title: 'Revisão e salvamento',
  },
] as const satisfies ReadonlyArray<{
  description: string
  fields: ReadonlyArray<FieldPath<OratorianoFormValues>>
  title: string
}>

const ALL_FIELD_PATHS = STEPS.flatMap((step) => step.fields)

type OratorianoFormEditorProps = {
  canGeneratePdf?: boolean
  detail: ParsedOratorianoFormDetail
  formId: string
  name: string
  onDeleted?: () => Promise<void>
  onDirtyChange?: (isDirty: boolean) => void
  onExitBypassChange?: (bypass: boolean) => void
  oratorianoId: string
}

export function OratorianoFormEditor({
  canGeneratePdf = false,
  detail,
  formId,
  name,
  onDeleted = async () => {},
  onDirtyChange,
  onExitBypassChange,
  oratorianoId,
}: OratorianoFormEditorProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [saveConfirmed, setSaveConfirmed] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const form = useForm<OratorianoFormValues>({
    defaultValues: fromFormDraftTransport(detail.data),
    resolver: zodResolver(oratorianoFormEditorSchema),
    shouldFocusError: false,
    shouldUnregister: false,
  })
  const mutation = useReplaceOratorianoFormDraft(oratorianoId, formId)
  const handleDeleteFinished = useCallback(async () => {
    onExitBypassChange?.(true)
    setIsDeleteOpen(false)

    try {
      await onDeleted()
    } catch (error) {
      onExitBypassChange?.(false)
      setIsDeleteOpen(true)
      throw error
    }
  }, [onDeleted, onExitBypassChange])
  const deleteMutation = useDeleteOratorianoFormDraft(
    oratorianoId,
    formId,
    { onDeleted: handleDeleteFinished },
  )
  const { errors, isDirty } = form.formState
  const isEditable = detail.status === 'DRAFT'
  const errorPaths = useMemo(() => getErrorPaths(errors), [errors])
  const status = getOratorianoFormStatusPresentation(detail.status)
  const displayedRevision = mutation.data?.draftRevision
    ?? detail.draftRevision

  useEffect(() => {
    headingRef.current?.focus()
  }, [activeStep])

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const changeStep = (nextStep: number) => {
    setSaveConfirmed(false)
    setActiveStep(nextStep)
  }

  const advance = () => {
    void form.trigger([...STEPS[activeStep].fields])
    changeStep(Math.min(activeStep + 1, STEPS.length - 1))
  }

  const submit = form.handleSubmit(
    (values) => {
      setSaveConfirmed(false)
      mutation.mutate(toFormDraftTransport(values), {
        onSuccess: (authoritative) => {
          form.reset(fromFormDraftTransport(authoritative.data))
          setSaveConfirmed(true)
        },
      })
    },
    (invalidFields) => {
      const [firstPath] = getErrorPaths(invalidFields)
      if (!firstPath) return
      const step = getStepForField(firstPath)
      setActiveStep(step)
      window.setTimeout(() => form.setFocus(firstPath), 0)
    },
  )

  return (
    <>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">
            {typeof detail.version === 'number'
              ? `Ficha adicional · versão ${detail.version}`
              : 'Ficha adicional · versão não informada'}
          </p>
          <h1 className="break-words font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {getOratorianoFormOriginLabel(detail.origin)}
            {typeof displayedRevision === 'number' && ` · revisão ${displayedRevision}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {isDirty && (
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Alterações não salvas
            </span>
          )}
          <Badge className={status.badgeClassName} variant="outline">
            {status.label}
          </Badge>
          {(isEditable
            || isDeleteOpen
            || deleteMutation.isPending
            || deleteMutation.isError) && (
            <DeleteOratorianoFormDialog
              canOpen={isEditable && !mutation.isPending}
              error={deleteMutation.error}
              isPending={deleteMutation.isPending}
              name={name}
              onDelete={(payload) => deleteMutation.mutate(payload)}
              onOpenChange={setIsDeleteOpen}
              onReset={() => deleteMutation.reset()}
              open={isDeleteOpen}
            />
          )}
        </div>
      </header>

      <Form {...form}>
        <form className="space-y-4" onSubmit={submit}>
          <nav aria-label="Etapas da ficha" className="overflow-hidden rounded-xl border bg-card p-3 sm:p-4">
            <ol className="grid grid-cols-5 gap-1">
              {STEPS.map((step, index) => {
                const isActive = index === activeStep
                const hasError = errorPaths.some((path) => getStepForField(path) === index)
                const isPast = index < activeStep
                return (
                  <li className="relative min-w-0" key={step.title}>
                    {index > 0 && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute right-1/2 top-3.5 h-px w-full bg-border',
                          isPast && 'bg-primary/40',
                        )}
                      />
                    )}
                    <button
                      aria-current={isActive ? 'step' : undefined}
                      aria-label={`Etapa ${index + 1}: ${step.title}${hasError ? ', contém erros' : ''}`}
                      className="relative z-[1] flex w-full flex-col items-center gap-1 rounded-lg p-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => changeStep(index)}
                      type="button"
                    >
                      <span
                        className={cn(
                          'grid h-7 w-7 place-items-center rounded-full border bg-background text-xs font-bold text-muted-foreground',
                          isActive && 'border-primary bg-primary text-primary-foreground',
                          isPast && !hasError && 'border-green-600 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-200',
                          hasError && 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200',
                        )}
                      >
                        {isPast && !hasError
                          ? <Check aria-hidden="true" className="h-4 w-4" />
                          : hasError
                            ? <Circle aria-hidden="true" className="h-3 w-3 fill-current" />
                            : index + 1}
                      </span>
                      <span className="hidden max-w-32 text-xs font-medium sm:block">
                        {step.title}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
            <p className="mt-2 text-center text-xs font-medium text-muted-foreground sm:hidden">
              Etapa {activeStep + 1} de {STEPS.length} · {STEPS[activeStep].title}
            </p>
          </nav>

          <Card>
            <CardHeader>
              {!isEditable && (
                <Alert variant="destructive" role="alert">
                  <AlertTitle>A edição desta ficha foi encerrada.</AlertTitle>
                  <AlertDescription>
                    A situação da ficha mudou no servidor. Os valores locais continuam visíveis, mas não podem ser salvos. Revise-os antes de sair desta página.
                  </AlertDescription>
                </Alert>
              )}
              {errorPaths.length > 0 && (
                <Alert variant="destructive" role="alert">
                  <AlertTitle>Há campos para revisar.</AlertTitle>
                  <AlertDescription>
                    Encontramos {errorPaths.length === 1
                      ? '1 campo com erro'
                      : `${errorPaths.length} campos com erro`}. Use as etapas marcadas para localizar cada campo.
                  </AlertDescription>
                </Alert>
              )}
              <div>
                <p className="text-sm font-medium text-primary">
                  Etapa {activeStep + 1} de {STEPS.length}
                </p>
                <h2
                  className="font-heading text-xl font-semibold outline-none"
                  ref={headingRef}
                  tabIndex={-1}
                >
                  {STEPS[activeStep].title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {STEPS[activeStep].description}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <fieldset className="contents" disabled={!isEditable}>
                {activeStep === 0 && <IdentificationStep />}
                {activeStep === 1 && <FamilyStep />}
                {activeStep === 2 && <HealthStep />}
                {activeStep === 3 && <DeclarationsStep />}
                {activeStep === 4 && <ReviewStep values={form.getValues()} />}
              </fieldset>

              {activeStep === 4 && (
                <div className="mt-6 border-t pt-6">
                  <FormPrintSection
                    canGenerate={canGeneratePdf && isEditable}
                    currentRevision={mutation.data?.draftRevision
                      ?? detail.draftRevision}
                    formId={formId}
                    isDirty={isDirty}
                    name={name}
                    oratorianoId={oratorianoId}
                    origin={detail.origin}
                  />
                </div>
              )}

              {mutation.isError && (
                <Alert className="mt-5" variant="destructive">
                  <AlertTitle>Não foi possível salvar o rascunho.</AlertTitle>
                  <AlertDescription>
                    {isConflictError(mutation.error)
                      ? 'A ficha foi alterada em outro lugar. Atualizamos a situação disponível; confira os dados locais antes de tentar novamente.'
                      : `${getErrorMessage(mutation.error)} Seus dados continuam nesta página para uma nova tentativa.`}
                  </AlertDescription>
                </Alert>
              )}
              {saveConfirmed && (
                <p
                  aria-live="polite"
                  className="mt-5 text-sm font-medium text-green-700 dark:text-green-300"
                  role="status"
                >
                  Rascunho salvo. Você continua na etapa {activeStep + 1}.
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  A troca de etapa não salva automaticamente.
                </p>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <Button
                    disabled={activeStep === 0}
                    onClick={() => changeStep(activeStep - 1)}
                    type="button"
                    variant="outline"
                  >
                    Voltar
                  </Button>
                  {activeStep < STEPS.length - 1 && (
                    <Button onClick={advance} type="button" variant="outline">
                      Avançar
                    </Button>
                  )}
                  <Button
                    className="col-span-2"
                    disabled={
                      mutation.isPending
                      || deleteMutation.isPending
                      || !isEditable
                    }
                    type="submit"
                  >
                    <Save aria-hidden="true" className="h-4 w-4" />
                    {mutation.isPending
                      ? 'Salvando rascunho…'
                      : isEditable
                        ? 'Salvar rascunho'
                        : 'Edição encerrada'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

    </>
  )
}

function getErrorPaths(
  errors: FieldErrors<OratorianoFormValues>,
): Array<FieldPath<OratorianoFormValues>> {
  return ALL_FIELD_PATHS.filter((path) => hasErrorAtPath(errors, path))
}

function hasErrorAtPath(
  errors: FieldErrors<OratorianoFormValues>,
  path: FieldPath<OratorianoFormValues>,
): boolean {
  let current: unknown = errors
  for (const part of path.split('.')) {
    if (typeof current !== 'object' || current === null || !(part in current)) {
      return false
    }
    current = Reflect.get(current, part)
  }
  return typeof current === 'object'
    && current !== null
    && 'message' in current
    && typeof current.message === 'string'
}

function getStepForField(path: FieldPath<OratorianoFormValues>): number {
  if (path.startsWith('health.')) return 2
  if (path.startsWith('declarations.') || path === 'signedOn') return 3
  if (path.startsWith('school')
    || path.startsWith('responsible.')
    || path.startsWith('father.')
    || path.startsWith('mother.')) return 1
  return 0
}
