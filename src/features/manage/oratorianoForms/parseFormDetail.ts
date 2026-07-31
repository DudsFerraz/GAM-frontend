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
  const result = oratorianoFormDraftSchema.safeParse(detail.data)

  if (!result.success) {
    throw new InvalidOratorianoFormDataError()
  }

  return { ...detail, data: result.data }
}
