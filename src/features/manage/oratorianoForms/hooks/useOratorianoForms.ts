import {
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query'

import { getOratorianoFormHistory } from '../api/oratorianoForms'
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
