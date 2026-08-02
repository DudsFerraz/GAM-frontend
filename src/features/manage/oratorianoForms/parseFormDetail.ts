import { oratorianoFormDraftSchema } from './schemas/formDraftSchema'
import type {
  OratorianoFormDetail,
  OratorianoFormDraft,
} from './types'

export class InvalidOratorianoFormDataError extends Error {
  constructor() {
    super('Invalid Oratoriano form data')
    this.name = 'InvalidOratorianoFormDataError'
  }
}

export type ParsedOratorianoFormDetail = Omit<
  OratorianoFormDetail,
  'data'
> & { data: OratorianoFormDraft }

export function parseOratorianoFormDetail(
  detail: OratorianoFormDetail,
): ParsedOratorianoFormDetail {
  const result = oratorianoFormDraftSchema.safeParse(
    normalizeEmptyDraftValues(detail.data),
  )

  if (!result.success) {
    throw new InvalidOratorianoFormDataError()
  }

  return { ...detail, data: result.data }
}

function normalizeEmptyDraftValues(value: unknown): unknown {
  if (value === null) return undefined
  if (typeof value === 'string') return value.trim() ? value : undefined
  if (Array.isArray(value)) return value.map(normalizeEmptyDraftValues)
  if (typeof value !== 'object') return value

  const normalized: Record<string, unknown> = {}
  for (const [key, nestedValue] of Object.entries(value)) {
    const normalizedValue = normalizeEmptyDraftValues(nestedValue)
    if (normalizedValue !== undefined) {
      normalized[key] = normalizedValue
    }
  }

  return normalized
}
