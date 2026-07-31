import { resolvePresentationLabel } from '@/lib/presentation'

import type {
  OratorianoFormOrigin,
  OratorianoFormStatus,
} from './types'

type FormStatusPresentation = {
  badgeClassName: string
  cardClassName: string
  dotClassName: string
  label: string
}

const FORM_STATUS_PRESENTATIONS = {
  DRAFT: {
    badgeClassName:
      'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200',
    cardClassName:
      'border-blue-200/80 bg-gradient-to-br from-card to-blue-50/50 dark:border-blue-900/80 dark:to-blue-950/30',
    dotClassName:
      'bg-blue-600 ring-blue-100 dark:bg-blue-500 dark:ring-blue-950',
    label: 'Rascunho',
  },
  COMPLETED: {
    badgeClassName:
      'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-200',
    cardClassName: '',
    dotClassName:
      'bg-green-600 ring-green-100 dark:bg-green-500 dark:ring-green-950',
    label: 'Concluída',
  },
  SUPERSEDED: {
    badgeClassName:
      'border-border bg-secondary text-secondary-foreground',
    cardClassName: '',
    dotClassName: 'bg-slate-400 ring-slate-100 dark:bg-slate-500 dark:ring-slate-900',
    label: 'Substituída',
  },
  REVOKED: {
    badgeClassName:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200',
    cardClassName: '',
    dotClassName:
      'bg-red-600 ring-red-100 dark:bg-red-500 dark:ring-red-950',
    label: 'Revogada',
  },
} as const satisfies Record<OratorianoFormStatus, FormStatusPresentation>

const UNKNOWN_FORM_STATUS_PRESENTATION = {
  badgeClassName: 'border-border bg-secondary text-secondary-foreground',
  cardClassName: '',
  dotClassName: 'bg-slate-400 ring-slate-100 dark:bg-slate-500 dark:ring-slate-900',
  label: 'Situação não identificada',
} as const satisfies FormStatusPresentation

const FORM_ORIGIN_LABELS = {
  PAPER_TRANSCRIPTION: 'Transcrição de papel',
  DIRECT_SYSTEM_ENTRY: 'Preenchimento no sistema',
} as const satisfies Record<OratorianoFormOrigin, string>

const RESPONSIBLE_RELATIONSHIP_LABELS = {
  SELF: 'Próprio Oratoriano',
  MOTHER: 'Mãe',
  FATHER: 'Pai',
  RELATIVE: 'Outro familiar',
  REFERENCE_ADULT: 'Adulto de referência',
} as const

const HEALTH_ANSWER_LABELS = {
  YES: 'Sim',
  NO: 'Não',
  NOT_INFORMED: 'Não informado',
} as const

export function getOratorianoFormStatusPresentation(
  status?: string | null,
): FormStatusPresentation {
  if (!status || !isKnownFormStatus(status)) {
    return UNKNOWN_FORM_STATUS_PRESENTATION
  }

  return FORM_STATUS_PRESENTATIONS[status]
}

function isKnownFormStatus(
  status: string,
): status is OratorianoFormStatus {
  return Object.hasOwn(FORM_STATUS_PRESENTATIONS, status)
}

export function getOratorianoFormOriginLabel(
  origin?: string | null,
): string {
  return resolvePresentationLabel(
    FORM_ORIGIN_LABELS,
    origin,
    'Origem não identificada',
  )
}

export function getOratorianoFormAttachmentLabel(
  exists?: boolean | null,
  pageCount?: number | null,
): string {
  if (exists === false) {
    return 'Nenhum anexo informado'
  }

  if (exists !== true) {
    return 'Situação do anexo não informada'
  }

  if (!Number.isInteger(pageCount) || (pageCount ?? 0) <= 0) {
    return 'Anexo disponível'
  }

  return pageCount === 1
    ? 'Anexo com 1 página'
    : `Anexo com ${pageCount} páginas`
}

export function getResponsibleRelationshipLabel(
  relationship?: string | null,
): string {
  return resolvePresentationLabel(
    RESPONSIBLE_RELATIONSHIP_LABELS,
    relationship,
    'Relação não identificada',
  )
}

export function getHealthAnswerLabel(answer?: string | null): string {
  return resolvePresentationLabel(
    HEALTH_ANSWER_LABELS,
    answer,
    'Resposta não identificada',
  )
}

export function getConfirmationLabel(value?: boolean | null): string {
  if (value === true) return 'Confirmado'
  if (value === false) return 'Não confirmado'
  return 'Não informado'
}
