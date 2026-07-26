const TYPOGRAPHIC_APOSTROPHES = /[\u2018\u2019\u201a\u201b\u2032\u00b4\u0060]/g
const TYPOGRAPHIC_HYPHENS = /[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g

export function canonicalizeNameSeparators(value: string): string {
  return value
    .normalize('NFC')
    .replace(TYPOGRAPHIC_APOSTROPHES, "'")
    .replace(TYPOGRAPHIC_HYPHENS, '-')
}

export function normalizeHumanEquivalentName(
  firstName: string,
  surname: string,
): string {
  return canonicalizeNameSeparators(`${firstName} ${surname}`)
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLocaleLowerCase('pt-BR')
}

export function areHumanEquivalentNames(
  left: { firstName?: string | null; surname?: string | null },
  right: { firstName?: string | null; surname?: string | null },
): boolean {
  if (!left.firstName || !left.surname || !right.firstName || !right.surname) {
    return false
  }

  return normalizeHumanEquivalentName(left.firstName, left.surname)
    === normalizeHumanEquivalentName(right.firstName, right.surname)
}
