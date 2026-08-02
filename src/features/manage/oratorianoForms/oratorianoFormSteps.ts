import type { FieldErrors, FieldPath } from 'react-hook-form'

import type { OratorianoFormValues } from './schemas/formDraftSchema'

export const ORATORIANO_FORM_STEPS = [
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

const ALL_FIELD_PATHS = ORATORIANO_FORM_STEPS.flatMap((step) => step.fields)

export function getErrorPaths(
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

export function getStepForField(path: FieldPath<OratorianoFormValues>): number {
  if (path.startsWith('health.')) return 2
  if (path.startsWith('declarations.') || path === 'signedOn') return 3
  if (path.startsWith('school')
    || path.startsWith('responsible.')
    || path.startsWith('father.')
    || path.startsWith('mother.')) {
    return 1
  }
  return 0
}
