const disabledDetailKeys = new Set<string>()
const detailStateListeners = new Set<() => void>()

function notifyDetailStateListeners(): void {
  for (const listener of detailStateListeners) listener()
}

function getDetailIdentity(oratorianoId: string, formId: string): string {
  return `${oratorianoId}\u0000${formId}`
}

export function disableOratorianoFormDetail(
  oratorianoId: string,
  formId: string,
): void {
  const key = getDetailIdentity(oratorianoId, formId)
  if (disabledDetailKeys.has(key)) return
  disabledDetailKeys.add(key)
  notifyDetailStateListeners()
}

export function isOratorianoFormDetailDisabled(
  oratorianoId: string,
  formId: string,
): boolean {
  return disabledDetailKeys.has(getDetailIdentity(oratorianoId, formId))
}

export function clearDisabledOratorianoFormDetail(
  oratorianoId: string,
  formId: string,
): void {
  const key = getDetailIdentity(oratorianoId, formId)
  if (!disabledDetailKeys.delete(key)) return
  notifyDetailStateListeners()
}

export function subscribeToOratorianoFormDetailState(
  listener: () => void,
): () => void {
  detailStateListeners.add(listener)
  return () => detailStateListeners.delete(listener)
}
