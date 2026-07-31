import {
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query'

import { getOratorianoFormHistory } from '../api/oratorianoForms'
import { getOratorianoFormDetail } from '../api/oratorianoForms'
import { parseOratorianoFormDetail } from '../parseFormDetail'
import {
  ORATORIANO_FORM_HISTORY_PAGE_SIZE,
  oratorianoFormQueryKeys,
} from '../queryKeys'

export function useOratorianoFormHistory(
  oratorianoId: string,
  page: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: oratorianoFormQueryKeys.history(
      oratorianoId,
      page,
      ORATORIANO_FORM_HISTORY_PAGE_SIZE,
    ),
    queryFn: () => getOratorianoFormHistory(
      oratorianoId,
      page,
      ORATORIANO_FORM_HISTORY_PAGE_SIZE,
    ),
    enabled: Boolean(oratorianoId) && enabled,
    placeholderData: keepPreviousData,
  })
}

export function useOratorianoFormDetail(
  oratorianoId: string,
  formId: string,
  canView: boolean,
  openedExplicitly: boolean,
) {
  return useQuery({
    queryKey: oratorianoFormQueryKeys.detail(oratorianoId, formId),
    queryFn: () => getOratorianoFormDetail(oratorianoId, formId),
    enabled: Boolean(oratorianoId)
      && Boolean(formId)
      && canView
      && openedExplicitly,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    select: parseOratorianoFormDetail,
  })
}
