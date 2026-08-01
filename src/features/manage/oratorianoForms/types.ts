import type { components } from '@/api/generated/gam-api'

export type OratorianoFormHistoryItem =
  components['schemas']['FormHistoryRDTO']
export type OratorianoFormHistoryPage =
  components['schemas']['PagedResponseFormHistoryRDTO']
export type OratorianoFormDetail = components['schemas']['FormRDTO']
export type OratorianoFormDraft = components['schemas']['FormDraftDTO']
export type OratorianoFormReason = components['schemas']['ReasonDTO']
export type CreateOratorianoFormRequest =
  components['schemas']['CreateFormDTO']
export type OratorianoFormStatus = NonNullable<
  OratorianoFormHistoryItem['status']
>
export type OratorianoFormOrigin = NonNullable<
  OratorianoFormHistoryItem['origin']
>
export type OratorianoFormPrintSnapshot =
  components['schemas']['PrintSnapshotRDTO']
export type OratorianoFormPrintSnapshotMode = NonNullable<
  OratorianoFormPrintSnapshot['mode']
>
