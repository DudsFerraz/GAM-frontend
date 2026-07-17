export function resolvePresentationLabel(
  labels: Readonly<Record<string, string>>,
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value || !Object.prototype.hasOwnProperty.call(labels, value)) {
    return fallback
  }

  return labels[value]
}
