export const ORATORIANO_FORM_HISTORY_PAGE_SIZE = 10

export const oratorianoFormQueryKeys = {
  all: ['oratoriano-forms'] as const,
  histories: () => [
    ...oratorianoFormQueryKeys.all,
    'history',
  ] as const,
  history: (
    oratorianoId: string,
    page: number,
    size = ORATORIANO_FORM_HISTORY_PAGE_SIZE,
  ) => [
    ...oratorianoFormQueryKeys.histories(),
    oratorianoId,
    { page, size },
  ] as const,
  detail: (oratorianoId: string, formId: string) => [
    ...oratorianoFormQueryKeys.all,
    'detail',
    oratorianoId,
    formId,
  ] as const,
  workspace: (oratorianoId: string, formId: string) => [
    ...oratorianoFormQueryKeys.all,
    'workspace',
    oratorianoId,
    formId,
  ] as const,
  snapshots: (oratorianoId: string, formId: string) => [
    ...oratorianoFormQueryKeys.all,
    'snapshots',
    oratorianoId,
    formId,
  ] as const,
  attachments: (oratorianoId: string, formId: string) => [
    ...oratorianoFormQueryKeys.workspace(oratorianoId, formId),
    'attachments',
  ] as const,
}
