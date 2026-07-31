import { api } from '@/lib/http'

import type { OratorianoFormHistoryPage } from '../types'

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
