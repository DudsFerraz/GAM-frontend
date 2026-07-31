import { api } from '@/lib/http'

import type { paths } from '@/api/generated/gam-api'

import type {
  OratorianoFormDetail,
  OratorianoFormHistoryPage,
} from '../types'

const ORATORIANO_FORM_DETAIL_PATH =
  '/oratorianos/{oratorianoId}/forms/{formId}' satisfies keyof paths

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

export async function getOratorianoFormDetail(
  oratorianoId: string,
  formId: string,
): Promise<OratorianoFormDetail> {
  const path = ORATORIANO_FORM_DETAIL_PATH
    .replace('{oratorianoId}', encodeURIComponent(oratorianoId))
    .replace('{formId}', encodeURIComponent(formId))
  const { data } = await api.get<OratorianoFormDetail>(path)

  return data
}
