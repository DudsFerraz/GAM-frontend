import type { OratorianoFormDraft } from './types'
import type { OratorianoFormValues } from './schemas/formDraftSchema'

const HEALTH_KEYS = [
  'medicalFollowUp',
  'physicalActivityRestriction',
  'medicineUse',
  'allergies',
  'convulsions',
  'frequentFainting',
  'heartCondition',
  'otherHealthCondition',
] as const

const emptyHealthQuestion = () => ({
  answer: '' as const,
  explanation: '',
  importantInstructions: '',
})

export function fromFormDraftTransport(
  draft: OratorianoFormDraft,
): OratorianoFormValues {
  const health = draft.health
  return {
    firstName: draft.firstName ?? '',
    surname: draft.surname ?? '',
    birthDate: draft.birthDate ?? '',
    cpf: draft.cpf ?? '',
    rg: draft.rg ?? '',
    phoneNumber: draft.phoneNumber ?? '',
    address: {
      addressLine: draft.address?.addressLine ?? '',
      addressNumber: draft.address?.addressNumber ?? '',
      neighborhood: draft.address?.neighborhood ?? '',
      cep: draft.address?.cep ?? '',
      city: draft.address?.city ?? '',
    },
    schoolName: draft.schoolName ?? '',
    schoolGrade: draft.schoolGrade ?? '',
    responsible: {
      relationship: draft.responsible?.relationship ?? '',
      relationshipComplement: draft.responsible?.relationshipComplement ?? '',
      firstName: draft.responsible?.firstName ?? '',
      surname: draft.responsible?.surname ?? '',
      cpf: draft.responsible?.cpf ?? '',
      phoneNumber: draft.responsible?.phoneNumber ?? '',
      email: draft.responsible?.email ?? '',
      atLeast18: fromOptionalBoolean(draft.responsible?.atLeast18),
    },
    father: {
      firstName: draft.father?.firstName ?? '',
      surname: draft.father?.surname ?? '',
      cpf: draft.father?.cpf ?? '',
    },
    mother: {
      firstName: draft.mother?.firstName ?? '',
      surname: draft.mother?.surname ?? '',
      cpf: draft.mother?.cpf ?? '',
    },
    health: {
      medicalFollowUp: fromHealthQuestion(health?.medicalFollowUp),
      physicalActivityRestriction: fromHealthQuestion(health?.physicalActivityRestriction),
      medicineUse: fromHealthQuestion(health?.medicineUse),
      allergies: fromHealthQuestion(health?.allergies),
      convulsions: fromHealthQuestion(health?.convulsions),
      frequentFainting: fromHealthQuestion(health?.frequentFainting),
      heartCondition: fromHealthQuestion(health?.heartCondition),
      otherHealthCondition: fromHealthQuestion(health?.otherHealthCondition),
      otherCare: health?.otherCare ?? '',
    },
    declarations: {
      signerRelationshipConfirmed: draft.declarations?.signerRelationshipConfirmed,
      informationTruthConfirmed: draft.declarations?.informationTruthConfirmed,
      healthInformationCurrentConfirmed: draft.declarations?.healthInformationCurrentConfirmed,
      informationUseUnderstood: draft.declarations?.informationUseUnderstood,
      formReviewed: draft.declarations?.formReviewed,
      imageAndVoiceAuthorizationAccepted: draft.declarations?.imageAndVoiceAuthorizationAccepted,
    },
    signedOn: draft.signedOn ?? '',
  }
}

function fromHealthQuestion(
  question: NonNullable<OratorianoFormDraft['health']>[typeof HEALTH_KEYS[number]] | undefined,
): OratorianoFormValues['health']['medicalFollowUp'] {
  return question
    ? {
        answer: question.answer ?? '',
        explanation: question.explanation ?? '',
        importantInstructions: question.importantInstructions ?? '',
      }
    : emptyHealthQuestion()
}

function fromOptionalBoolean(value: boolean | undefined): '' | 'true' | 'false' {
  if (value === undefined) return ''
  return value ? 'true' : 'false'
}

export function toFormDraftTransport(
  values: OratorianoFormValues,
): OratorianoFormDraft {
  const address = compactObject({
    addressLine: optionalText(values.address.addressLine),
    addressNumber: optionalText(values.address.addressNumber),
    neighborhood: optionalText(values.address.neighborhood),
    cep: optionalDigits(values.address.cep),
    city: optionalText(values.address.city),
  })
  let father = compactParent(values.father)
  let mother = compactParent(values.mother)

  const relationship = values.responsible.relationship || undefined
  const responsibleSource = relationship === 'SELF'
    ? {
        firstName: values.firstName,
        surname: values.surname,
        cpf: values.cpf,
        phoneNumber: values.phoneNumber,
      }
    : values.responsible
  const responsible = compactObject({
    relationship,
    relationshipComplement: optionalText(values.responsible.relationshipComplement),
    firstName: optionalText(responsibleSource.firstName),
    surname: optionalText(responsibleSource.surname),
    cpf: optionalDigits(responsibleSource.cpf),
    phoneNumber: optionalPhone(responsibleSource.phoneNumber),
    email: relationship === 'SELF'
      ? undefined
      : optionalText(values.responsible.email)?.toLowerCase(),
    atLeast18: values.responsible.atLeast18 === ''
      ? undefined
      : values.responsible.atLeast18 === 'true',
  })

  if (relationship === 'MOTHER' && responsible) {
    mother = compactObject({
      firstName: responsible.firstName,
      surname: responsible.surname,
      cpf: responsible.cpf,
    })
  }
  if (relationship === 'FATHER' && responsible) {
    father = compactObject({
      firstName: responsible.firstName,
      surname: responsible.surname,
      cpf: responsible.cpf,
    })
  }

  const healthEntries = HEALTH_KEYS.map((key) => [
    key,
    compactObject({
      answer: values.health[key].answer || undefined,
      explanation: optionalText(values.health[key].explanation),
      importantInstructions: optionalText(values.health[key].importantInstructions),
    }),
  ] as const)
  const health = compactObject({
    ...Object.fromEntries(healthEntries),
    otherCare: optionalText(values.health.otherCare),
  })
  const declarations = compactObject({ ...values.declarations })

  return compactObject({
    firstName: optionalText(values.firstName),
    surname: optionalText(values.surname),
    birthDate: optionalText(values.birthDate),
    cpf: optionalDigits(values.cpf),
    rg: optionalText(values.rg),
    address,
    phoneNumber: optionalPhone(values.phoneNumber),
    schoolName: optionalText(values.schoolName),
    schoolGrade: optionalText(values.schoolGrade),
    responsible,
    father,
    mother,
    health,
    declarations,
    signedOn: optionalText(values.signedOn),
  }) ?? {}
}

function compactParent(parent: OratorianoFormValues['father']) {
  return compactObject({
    firstName: optionalText(parent.firstName),
    surname: optionalText(parent.surname),
    cpf: optionalDigits(parent.cpf),
  })
}

function optionalText(value: string): string | undefined {
  const normalized = value.trim()
  return normalized || undefined
}

function optionalDigits(value: string): string | undefined {
  const normalized = value.replace(/\D/g, '')
  return normalized || undefined
}

function optionalPhone(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const digits = trimmed.replace(/\D/g, '')
  return trimmed.startsWith('+') ? `+${digits}` : `+55${digits}`
}

function compactObject<T extends object>(value: T): T | undefined {
  return Object.values(value).some((item) => item !== undefined)
    ? value
    : undefined
}
