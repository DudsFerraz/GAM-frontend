import { AxiosError } from 'axios'

type ErrorMessageContext = 'authentication' | 'default'

const ERROR_CODE_MESSAGES: Readonly<Record<string, string>> = {
  ACCESS_DENIED: 'Você não tem acesso para realizar esta ação.',
  CONFLICT: 'Não foi possível concluir porque os dados foram alterados ou já existem.',
  DATA_INTEGRITY_ERROR: 'Os dados informados entram em conflito com um cadastro existente.',
  EVENT_AUDIENCE_PERMISSION_INVALID: 'Selecione um público válido para o evento.',
  EVENT_HAS_PRESENCES: 'Remova as presenças ativas antes de remover este evento.',
  EVENT_STATUS_TRANSITION_NOT_ALLOWED: 'A situação atual do evento não permite esta ação.',
  EVENT_TYPE_NOT_MANAGEABLE: 'Este tipo de evento deve ser gerenciado pelo fluxo específico.',
  FORBIDDEN: 'Você não tem acesso para realizar esta ação.',
  FORBIDDEN_OPERATION: 'Esta ação não está disponível para sua conta.',
  GAM_LOCATION_ALREADY_EXISTS: 'Já existe um local cadastrado com estes dados.',
  GAM_LOCATION_IN_USE: 'Este local está associado a eventos e não pode ser removido.',
  ID_GENERATION_FAILED: 'Não foi possível concluir a operação. Tente novamente.',
  INTERNAL_ERROR: 'O serviço encontrou um problema. Tente novamente mais tarde.',
  INVALID_COMMAND: 'Não foi possível realizar esta ação com os dados informados.',
  INVALID_PARAMETER_TYPE: 'Um dos dados informados possui formato inválido.',
  INVALID_PHONE_NUMBER: 'Informe um telefone válido.',
  INVALID_REQUEST: 'Revise os dados informados e tente novamente.',
  INVALID_SEARCH_FILTER: 'Revise os filtros da pesquisa e tente novamente.',
  MALFORMED_JSON: 'Não foi possível processar os dados enviados.',
  NOT_FOUND: 'O conteúdo solicitado não foi encontrado.',
  ORATORIANO_DELETED: 'Este cadastro foi excluído e não pode receber uma nova presença. Atualize a busca antes de continuar.',
  ORATORIANO_HAS_IMMUTABLE_FORMS: 'Este cadastro possui uma ficha concluída, substituída ou revogada e não pode ser excluído.',
  ORATORIANO_NAME_RESERVED: 'Já existe um cadastro ativo ou excluído com esse nome. Localize a pessoa correta antes de continuar.',
  ORATORIANO_FORM_IMMUTABLE: 'A situação atual da ficha não permite gerar este PDF.',
  ORATORIANO_FORM_NOT_CURRENT: 'Salve a revisão atual antes de gerar um novo PDF.',
  ORATORIANO_FORM_PDF_GENERATION_FAILED: 'Não foi possível gerar o PDF. Tente novamente.',
  ORATORIO_DATE_ALREADY_EXISTS: 'Já existe um Oratório cadastrado nesta data.',
  ORATORIO_HAS_ACTIVE_ATTENDANCE: 'Remova as presenças ativas antes de excluir este Oratório.',
  ORATORIO_LIFECYCLE_CONFLICT: 'A situação atual do Oratório não permite esta ação.',
  ORATORIO_LOCATION_UNAVAILABLE: 'O local configurado para o Oratório não está disponível.',
  ORATORIO_TEAM_MEMBER_INACTIVE: 'Somente membros ativos podem receber uma nova atribuição de equipe.',
  PERSISTENCE_ERROR: 'Não foi possível salvar os dados. Tente novamente.',
  PRESENCE_ALREADY_REGISTERED: 'Este membro já possui presença registrada neste evento.',
  PRESENCE_EDIT_NOT_ALLOWED: 'A situação atual do evento não permite editar esta presença.',
  PRESENCE_REGISTRATION_NOT_ALLOWED: 'O registro de presença não está disponível para este evento neste momento.',
  PRESENCE_REMOVAL_NOT_ALLOWED: 'A situação atual do evento não permite remover esta presença.',
  RESOURCE_CONFLICT: 'Não foi possível concluir porque já existe um cadastro conflitante.',
  RESOURCE_NOT_FOUND: 'O conteúdo solicitado não foi encontrado.',
  PRINT_SNAPSHOT_NOT_FOUND: 'O documento solicitado não foi encontrado. Gere um novo PDF.',
  VALIDATION_ERROR: 'Revise os campos informados e tente novamente.',
}

export class SafeHttpError extends Error {
  readonly status?: number
  readonly code?: string
  readonly transportCode?: string

  constructor(
    status?: number,
    code?: string,
    transportCode?: string,
  ) {
    super('A solicitação não pôde ser concluída.')
    this.name = 'SafeHttpError'
    this.status = status
    this.code = code
    this.transportCode = transportCode
  }
}

function getResponseErrorCode(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null || !('code' in data)) {
    return undefined
  }

  return typeof data.code === 'string' ? data.code : undefined
}

export async function normalizeHttpError(error: unknown): Promise<unknown> {
  if (!(error instanceof AxiosError)) {
    return error
  }

  const responseData = error.response?.data
  let errorCode = getResponseErrorCode(responseData)

  if (!errorCode && typeof Blob !== 'undefined' && responseData instanceof Blob) {
    try {
      const parsedData: unknown = JSON.parse(await responseData.text())
      errorCode = getResponseErrorCode(parsedData)
    } catch {
      // A PDF error response can be a non-JSON blob. Keep only status metadata.
    }
  }

  return new SafeHttpError(error.response?.status, errorCode, error.code)
}

export const getErrorMessage = (
  error: unknown,
  context: ErrorMessageContext = 'default',
): string => {
  if (error instanceof SafeHttpError) {
    if (context === 'authentication' && error.status === 401) {
      return 'E-mail ou senha inválidos. Confira os dados e tente novamente.'
    }

    if (error.code && ERROR_CODE_MESSAGES[error.code]) {
      return ERROR_CODE_MESSAGES[error.code]
    }

    switch (error.status) {
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

    if (error.transportCode === 'ECONNABORTED') {
      return 'A solicitação demorou mais que o esperado. Tente novamente.'
    }

    if (error.transportCode === 'ERR_NETWORK' || error.status === undefined) {
      return 'Não foi possível se conectar ao serviço. Verifique sua conexão e tente novamente.'
    }
  }

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

export const isNotFoundError = (error: unknown): boolean =>
  error instanceof AxiosError && error.response?.status === 404
