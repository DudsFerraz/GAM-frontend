const UUID_PATTERN =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi
const UNSAFE_FILENAME_CHARACTERS = /[<>:"/\\|?*]/g

function sanitizeFilenamePart(value: string | undefined): string {
  return (value ?? '')
    .replace(UUID_PATTERN, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(UNSAFE_FILENAME_CHARACTERS, ' ')
    .split('')
    .filter((character) => character.charCodeAt(0) >= 32)
    .join('')
    .replace(/[^a-zA-Z0-9 _-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[ .]+$/g, '')
}

export function buildOratorianoFormPdfFilename(input: {
  name?: string | null
  draftRevision?: number | null
  generatedAt?: string | null
}): string {
  const name = sanitizeFilenamePart(input.name ?? undefined) || 'Oratoriano'
  const revision = Number.isInteger(input.draftRevision)
    && (input.draftRevision ?? 0) >= 0
    ? `revisao-${input.draftRevision}`
    : undefined
  const generatedDate = input.generatedAt?.slice(0, 10).replace(/[^0-9-]/g, '')
  const date = generatedDate && /^\d{4}-\d{2}-\d{2}$/.test(generatedDate)
    ? generatedDate
    : undefined

  return [name, 'ficha', revision ?? date].filter(Boolean).join('-') + '.pdf'
}

export function downloadBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  link.rel = 'noopener'
  link.className = 'sr-only'
  document.body.append(link)

  try {
    link.click()
  } finally {
    link.remove()
    URL.revokeObjectURL(objectUrl)
  }
}
