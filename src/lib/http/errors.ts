import { AxiosError } from 'axios'

type ErrorMessageContext = 'authentication' | 'default'

const ERROR_CODE_MESSAGES: Readonly<Record<string, string>> = {
  ACCESS_DENIED: 'Você não tem acesso para realizar esta ação.',
  CONFLICT: 'Não foi possível concluir porque os dados foram alterados ou já existem.',
  DATA_INTEGRITY_ERROR: 'Os dados informados entram em conflito com um cadastro existente.',
  FORBIDDEN: 'Você não tem acesso para realizar esta ação.',
  FORBIDDEN_OPERATION: 'Esta ação não está disponível para sua conta.',
  ID_GENERATION_FAILED: 'Não foi possível concluir a operação. Tente novamente.',
  INTERNAL_ERROR: 'O serviço encontrou um problema. Tente novamente mais tarde.',
  INVALID_COMMAND: 'Não foi possível realizar esta ação com os dados informados.',
  INVALID_PARAMETER_TYPE: 'Um dos dados informados possui formato inválido.',
  INVALID_PHONE_NUMBER: 'Informe um telefone válido.',
  INVALID_REQUEST: 'Revise os dados informados e tente novamente.',
  INVALID_SEARCH_FILTER: 'Revise os filtros da pesquisa e tente novamente.',
  MALFORMED_JSON: 'Não foi possível processar os dados enviados.',
  NOT_FOUND: 'O conteúdo solicitado não foi encontrado.',
  PERSISTENCE_ERROR: 'Não foi possível salvar os dados. Tente novamente.',
  RESOURCE_CONFLICT: 'Não foi possível concluir porque já existe um cadastro conflitante.',
  RESOURCE_NOT_FOUND: 'O conteúdo solicitado não foi encontrado.',
  VALIDATION_ERROR: 'Revise os campos informados e tente novamente.',
}

function getResponseErrorCode(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null || !('code' in data)) {
    return undefined
  }

  return typeof data.code === 'string' ? data.code : undefined
}

export const getErrorMessage = (
  error: unknown,
  context: ErrorMessageContext = 'default',
): string => {
  if (error instanceof AxiosError) {
    const status = error.response?.status

    if (context === 'authentication' && status === 401) {
      return 'E-mail ou senha inválidos. Confira os dados e tente novamente.'
    }

    const errorCode = getResponseErrorCode(error.response?.data)
    if (errorCode && ERROR_CODE_MESSAGES[errorCode]) {
      return ERROR_CODE_MESSAGES[errorCode]
    }

    switch (status) {
      case 400:
      case 422:
        return 'Revise os dados informados e tente novamente.'
      case 401:
        return 'Sua sessão expirou. Entre novamente para continuar.'
      case 403:
        return 'Você não tem acesso para realizar esta ação.'
      case 404:
        return 'O conteúdo solicitado não foi encontrado.'
      case 409:
        return 'Não foi possível concluir porque os dados estão em conflito.'
      case 429:
        return 'Muitas tentativas foram realizadas. Aguarde um momento e tente novamente.'
      case 500:
      case 502:
      case 503:
      case 504:
        return 'O serviço está indisponível no momento. Tente novamente mais tarde.'
    }

    if (error.code === 'ECONNABORTED') {
      return 'A solicitação demorou mais que o esperado. Tente novamente.'
    }

    if (!error.response || error.code === 'ERR_NETWORK') {
      return 'Não foi possível se conectar ao serviço. Verifique sua conexão e tente novamente.'
    }
  }

  return 'Ocorreu um erro inesperado. Tente novamente.'
}

export const isForbiddenError = (error: unknown): boolean =>
  error instanceof AxiosError && error.response?.status === 403
