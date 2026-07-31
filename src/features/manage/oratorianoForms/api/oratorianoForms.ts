import { api } from '@/lib/http'

import type { paths } from '@/api/generated/gam-api'

import type {
  OratorianoFormDraft,
  OratorianoFormDetail,
  OratorianoFormHistoryPage,
  OratorianoFormOrigin,
  OratorianoFormReason,
} from '../types'

const ORATORIANO_FORM_DETAIL_PATH =
  '/oratorianos/{oratorianoId}/forms/{formId}' satisfies keyof paths
const ORATORIANO_FORMS_PATH =
  '/oratorianos/{oratorianoId}/forms' satisfies keyof paths

function formCollectionPath(oratorianoId: string) {
  return ORATORIANO_FORMS_PATH.replace(
    '{oratorianoId}',
    encodeURIComponent(oratorianoId),
  )
}

function formDetailPath(oratorianoId: string, formId: string) {
  return ORATORIANO_FORM_DETAIL_PATH
    .replace('{oratorianoId}', encodeURIComponent(oratorianoId))
    .replace('{formId}', encodeURIComponent(formId))
}

export async function getOratorianoFormHistory(
  oratorianoId: string,
  page: number,
  size = 10,
): Promise<OratorianoFormHistoryPage> {
  const { data } = await api.get<OratorianoFormHistoryPage>(
    `/oratorianos/${oratorianoId}/forms`,
    { params: { page, size } },
  )

  return data
}

export async function createOratorianoForm(
  oratorianoId: string,
  origin: OratorianoFormOrigin,
): Promise<OratorianoFormDetail> {
  if (origin !== 'PAPER_TRANSCRIPTION'
    && origin !== 'DIRECT_SYSTEM_ENTRY') {
    throw new Error('Invalid Oratoriano form origin')
  }

  const { data } = await api.post<OratorianoFormDetail>(
    formCollectionPath(oratorianoId),
    { origin },
  )
  return data
}

export async function getOratorianoFormDetail(
  oratorianoId: string,
  formId: string,
): Promise<OratorianoFormDetail> {
  const { data } = await api.get<OratorianoFormDetail>(
    formDetailPath(oratorianoId, formId),
  )

  return data
}

export async function replaceOratorianoFormDraft(
  oratorianoId: string,
  formId: string,
  draft: OratorianoFormDraft,
): Promise<OratorianoFormDetail> {
  const { data } = await api.put<OratorianoFormDetail>(
    formDetailPath(oratorianoId, formId),
    draft,
  )

  return data
}

export async function deleteOratorianoFormDraft(
  oratorianoId: string,
  formId: string,
  payload: OratorianoFormReason,
): Promise<void> {
  await api.delete<void>(formDetailPath(oratorianoId, formId), {
    data: payload,
  })
}
