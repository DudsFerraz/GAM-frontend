import { getErrorMessage, SafeHttpError } from '@/lib/http'

import { InvalidOratorianoFormDataError } from './parseFormDetail'

const DRAFT_VALIDATION_CODES = new Set([
  'INVALID_REQUEST',
  'VALIDATION_ERROR',
])

export function getOratorianoFormDraftSaveErrorMessage(error: unknown): string {
  if (error instanceof InvalidOratorianoFormDataError) {
    return 'O rascunho pode ficar incompleto, mas não foi possível confirmar a resposta do servidor. Tente salvar novamente.'
  }

  if (error instanceof SafeHttpError
    && (DRAFT_VALIDATION_CODES.has(error.code ?? '')
      || error.status === 400
      || error.status === 422)) {
    return 'O rascunho pode ser salvo mesmo incompleto, mas os valores preenchidos precisam estar em formato válido. Revise os campos preenchidos e tente novamente.'
  }

  return getErrorMessage(error)
}
