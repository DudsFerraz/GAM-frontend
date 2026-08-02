import { AlertTriangle, Check, X } from 'lucide-react'

import { cn } from '@/lib/utils'

import {
  ORATORIANO_FORM_STEPS,
} from '../oratorianoFormSteps'
import type { OratorianoFormStepStatus } from '../stepStatus'

type OratorianoFormStepperProps = {
  activeStep: number
  stepStatuses: readonly OratorianoFormStepStatus[]
  visitedSteps: ReadonlySet<number>
  onStepChange: (step: number) => void
}

export function OratorianoFormStepper({
  activeStep,
  onStepChange,
  stepStatuses,
  visitedSteps,
}: OratorianoFormStepperProps) {
  return (
    <nav aria-label="Etapas da ficha" className="overflow-hidden rounded-xl border bg-card p-3 sm:p-4">
      <ol className="grid grid-cols-5 gap-1">
        {ORATORIANO_FORM_STEPS.map((step, index) => {
          const isActive = index === activeStep
          const isVisited = visitedSteps.has(index)
          const stepStatus = stepStatuses[index]
          return (
            <li className="relative min-w-0" key={step.title}>
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute right-1/2 top-3.5 h-px w-full bg-border"
                />
              )}
              <button
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Etapa ${index + 1}: ${step.title}, ${isVisited ? getStepStatusLabel(stepStatus) : 'ainda não iniciada'}`}
                className="relative z-[1] flex w-full flex-col items-center gap-1 rounded-lg p-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onStepChange(index)}
                type="button"
              >
                <span
                  className={cn(
                    'grid h-7 w-7 place-items-center rounded-full border bg-background text-xs font-bold text-muted-foreground',
                    isVisited && getStepStatusClassName(stepStatus),
                    !isVisited && 'opacity-60',
                    isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-card',
                  )}
                >
                  {isVisited ? <StepStatusIcon status={stepStatus} /> : index + 1}
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
        Etapa {activeStep + 1} de {ORATORIANO_FORM_STEPS.length} · {ORATORIANO_FORM_STEPS[activeStep].title}
      </p>
      <div
        aria-label="Legenda dos status das etapas"
        className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
      >
        <StepStatusLegendIcon label="Concluída" status="complete" />
        <StepStatusLegendIcon label="Com campos inválidos" status="invalid" />
        <StepStatusLegendIcon
          label="Campos obrigatórios pendentes"
          status="incomplete"
        />
      </div>
    </nav>
  )
}

function getStepStatusLabel(status: OratorianoFormStepStatus) {
  if (status === 'complete') return 'concluída'
  if (status === 'invalid') return 'com campos inválidos'
  return 'com campos obrigatórios pendentes'
}

function getStepStatusClassName(status: OratorianoFormStepStatus) {
  if (status === 'complete') {
    return 'border-green-600 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-200'
  }
  if (status === 'invalid') {
    return 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200'
  }
  return 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
}

function StepStatusIcon({ status }: { status: OratorianoFormStepStatus }) {
  if (status === 'complete') return <Check aria-hidden="true" className="h-4 w-4" />
  if (status === 'invalid') return <X aria-hidden="true" className="h-4 w-4" />
  return <AlertTriangle aria-hidden="true" className="h-4 w-4" />
}

function StepStatusLegendIcon({
  label,
  status,
}: {
  label: string
  status: OratorianoFormStepStatus
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn('grid h-4 w-4 place-items-center rounded-full', getStepStatusClassName(status))}>
        <StepStatusIcon status={status} />
      </span>
      {label}
    </span>
  )
}
