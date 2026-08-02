import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useForm,
  useWatch,
} from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Form } from '@/components/ui/Form'
import { fromFormDraftTransport, toFormDraftTransport } from '../formDraftMapper'
import {
  isConflictError,
  useDeleteOratorianoFormDraft,
  useReplaceOratorianoFormDraft,
} from '../hooks/useOratorianoForms'
import type { ParsedOratorianoFormDetail } from '../parseFormDetail'
import { getOratorianoFormDraftSaveErrorMessage } from '../saveError'
import {
  getOratorianoFormOriginLabel,
  getOratorianoFormStatusPresentation,
} from '../presentation'
import {
  getOratorianoFormStepMissingFields,
  getOratorianoFormStepStatuses,
} from '../stepStatus'
import {
  oratorianoFormEditorSchema,
  type OratorianoFormValues,
} from '../schemas/formDraftSchema'
import {
  getErrorPaths,
  getStepForField,
  ORATORIANO_FORM_STEPS,
} from '../oratorianoFormSteps'
import {
  DeclarationsStep,
  FamilyStep,
  HealthStep,
  IdentificationStep,
  ReviewStep,
} from './OratorianoFormStepFields'
import { DeleteOratorianoFormDialog } from './DeleteOratorianoFormDialog'
import { FormPrintSection } from './FormPrintSection'
import { OratorianoFormStepper } from './OratorianoFormStepper'

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
  const [visitedSteps, setVisitedSteps] = useState<ReadonlySet<number>>(
    () => new Set([0]),
  )
  const headingRef = useRef<HTMLHeadingElement>(null)
  const form = useForm<OratorianoFormValues>({
    defaultValues: fromFormDraftTransport(detail.data),
    mode: 'onChange',
    resolver: zodResolver(oratorianoFormEditorSchema),
    reValidateMode: 'onChange',
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
  const watchedValues = useWatch({ control: form.control })
  const stepStatuses = getOratorianoFormStepStatuses(
    watchedValues,
    ORATORIANO_FORM_STEPS,
  )
  const status = getOratorianoFormStatusPresentation(detail.status)
  const displayedRevision = mutation.data?.draftRevision
    ?? detail.draftRevision

  useEffect(() => {
    headingRef.current?.focus()
  }, [activeStep])

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const changeStep = async (nextStep: number) => {
    setSaveConfirmed(false)
    if (nextStep > activeStep) {
      const currentStep = ORATORIANO_FORM_STEPS[activeStep]
      await form.trigger([...currentStep.fields])
      const missingFields = getOratorianoFormStepMissingFields(
        form.getValues(),
        currentStep,
      )
      if (missingFields.length > 0) {
        for (const missingField of missingFields) {
          form.setError(missingField.field, {
            message: missingField.message,
            type: 'required',
          })
        }
        window.setTimeout(() => form.setFocus(missingFields[0].field), 0)
        return
      }
    }

    setVisitedSteps((current) => {
      if (current.has(nextStep)) return current
      const next = new Set(current)
      next.add(nextStep)
      return next
    })
    setActiveStep(nextStep)
  }

  const advance = () => {
    void changeStep(Math.min(activeStep + 1, ORATORIANO_FORM_STEPS.length - 1))
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
        <form className="space-y-4" noValidate onSubmit={submit}>
          <OratorianoFormStepper
            activeStep={activeStep}
            onStepChange={(step) => void changeStep(step)}
            stepStatuses={stepStatuses}
            visitedSteps={visitedSteps}
          />

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
                  Etapa {activeStep + 1} de {ORATORIANO_FORM_STEPS.length}
                </p>
                <h2
                  className="font-heading text-xl font-semibold outline-none"
                  ref={headingRef}
                  tabIndex={-1}
                >
                  {ORATORIANO_FORM_STEPS[activeStep].title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ORATORIANO_FORM_STEPS[activeStep].description}
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
                      : `${getOratorianoFormDraftSaveErrorMessage(mutation.error)} Seus dados continuam nesta página para uma nova tentativa.`}
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
                    onClick={() => void changeStep(activeStep - 1)}
                    type="button"
                    variant="outline"
                  >
                    Voltar
                  </Button>
                  {activeStep < ORATORIANO_FORM_STEPS.length - 1 && (
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
