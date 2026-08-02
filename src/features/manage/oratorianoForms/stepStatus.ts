import type { FieldPath } from 'react-hook-form'

import {
  oratorianoFormCompletionSchema,
  type OratorianoFormValues,
} from './schemas/formDraftSchema'

export type OratorianoFormStepStatus =
  | 'complete'
  | 'incomplete'
  | 'invalid'

export type OratorianoFormStepDefinition = {
  fields: ReadonlyArray<FieldPath<OratorianoFormValues>>
}

export type OratorianoFormStepIssue = {
  message: string
  path: ReadonlyArray<PropertyKey>
}

export type OratorianoFormStepMissingField = {
  field: FieldPath<OratorianoFormValues>
  message: string
}

export function getOratorianoFormStepStatuses(
  values: unknown,
  steps: ReadonlyArray<OratorianoFormStepDefinition>,
): Array<OratorianoFormStepStatus> {
  const result = oratorianoFormCompletionSchema.safeParse(values)
  const issues = result.success ? [] : result.error.issues
  const sectionStatuses = steps.map((step, stepIndex) => {
    if (stepIndex === steps.length - 1) return 'complete'

    const stepIssues = issues.filter((issue) => (
      step.fields.some((field) => isPathInField(issue.path, field))
    ))
    const hasInvalidValue = stepIssues.some((issue) => (
      hasValueAtIssuePath(values, issue.path, step.fields)
    ))
    const hasMissingValue = stepIssues.some((issue) => (
      !hasValueAtIssuePath(values, issue.path, step.fields)
    ))
    const hasRelevantValue = step.fields.some((field) => (
      isPresent(getValueAtPath(values, field))
    ))

    if (hasInvalidValue) return 'invalid'
    if (hasMissingValue || !hasRelevantValue) return 'incomplete'
    return 'complete'
  })

  const reviewStatus = getReviewStatus(sectionStatuses)
  return [...sectionStatuses.slice(0, -1), reviewStatus]
}

export function getOratorianoFormStepIssues(
  values: unknown,
  step: OratorianoFormStepDefinition,
): Array<OratorianoFormStepIssue> {
  const result = oratorianoFormCompletionSchema.safeParse(values)
  if (result.success) return []

  return result.error.issues.filter((issue) => (
    step.fields.some((field) => isPathInField(issue.path, field))
  ))
}

export function getOratorianoFormStepMissingFields(
  values: unknown,
  step: OratorianoFormStepDefinition,
): Array<OratorianoFormStepMissingField> {
  return getOratorianoFormStepIssues(values, step)
    .filter((issue) => !hasValueAtIssuePath(values, issue.path, step.fields))
    .flatMap((issue) => {
      const issuePath = issue.path.map(String).join('.')
      const field = step.fields.find((candidate) => candidate === issuePath)
      return field ? [{ field, message: issue.message }] : []
    })
}

function getReviewStatus(
  sectionStatuses: ReadonlyArray<OratorianoFormStepStatus>,
): OratorianoFormStepStatus {
  if (sectionStatuses.some((status) => status === 'invalid')) return 'invalid'
  if (sectionStatuses.some((status) => status === 'incomplete')) return 'incomplete'
  return 'complete'
}

function isPathInField(path: ReadonlyArray<PropertyKey>, field: string): boolean {
  const issuePath = path.map(String).join('.')
  return issuePath === field || field.startsWith(`${issuePath}.`)
}

function hasValueAtIssuePath(
  values: unknown,
  issuePath: ReadonlyArray<PropertyKey>,
  fields: ReadonlyArray<FieldPath<OratorianoFormValues>>,
): boolean {
  const path = issuePath.map(String).join('.')
  const exactValue = getValueAtPath(values, path)
  if (isPresent(exactValue)) return true

  return fields
    .filter((field) => field.startsWith(`${path}.`))
    .some((field) => isPresent(getValueAtPath(values, field)))
}

function getValueAtPath(values: unknown, path: string): unknown {
  let current: unknown = values
  for (const part of path.split('.')) {
    if (typeof current !== 'object' || current === null || !(part in current)) {
      return undefined
    }
    current = Reflect.get(current, part)
  }
  return current
}

function isPresent(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'boolean') return true
  return value !== null && value !== undefined
}
