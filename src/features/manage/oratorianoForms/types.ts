import type { components } from '@/api/generated/gam-api'

export type OratorianoFormHistoryItem =
  components['schemas']['FormHistoryRDTO']
export type OratorianoFormHistoryPage =
  components['schemas']['PagedResponseFormHistoryRDTO']
export type OratorianoFormDetail = components['schemas']['FormRDTO']
export type OratorianoFormDraft = components['schemas']['FormDraftDTO']
export type OratorianoFormStatus = NonNullable<
  OratorianoFormHistoryItem['status']
>
export type OratorianoFormOrigin = NonNullable<
  OratorianoFormHistoryItem['origin']
>
