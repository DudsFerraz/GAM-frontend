import { z } from 'zod'

import type { FilterValueValidator } from './types'

const INVALID_EMAIL_MESSAGE = 'Digite um e-mail completo e válido.'

export const validateEmailSearchValue: FilterValueValidator = (
  value,
  comparisonMethod,
) => {
  if (typeof value !== 'string') {
    return INVALID_EMAIL_MESSAGE
  }

  const normalizedValue = value.trim()

  if (comparisonMethod === 'LIKE') {
    if (normalizedValue.length < 3) {
      return 'Digite pelo menos 3 caracteres para pesquisar por e-mail.'
    }

    const atIndex = normalizedValue.indexOf('@')
    if (normalizedValue.includes('.') && atIndex === -1) {
      return 'Inclua @ ao pesquisar um trecho de e-mail que contenha ponto.'
    }

    if (atIndex !== -1 && atIndex < 2) {
      return 'Digite pelo menos 2 caracteres antes de @.'
    }

    return undefined
  }

  if (comparisonMethod === 'EQUALS') {
    return z.email().safeParse(normalizedValue).success
      ? undefined
      : INVALID_EMAIL_MESSAGE
  }

  return undefined
}

export function createTrimmedTextMaxLengthValidator(
  maxLength: number,
  message: string,
): FilterValueValidator {
  return (value) => (
    typeof value === 'string' && value.trim().length <= maxLength
      ? undefined
      : message
  )
}
