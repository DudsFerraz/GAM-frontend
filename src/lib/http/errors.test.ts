import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { describe, expect, it } from 'vitest'

import { getErrorMessage, isForbiddenError } from './errors'

function createAxiosError(
  status?: number,
  data?: unknown,
  code?: string,
): AxiosError {
  const config: InternalAxiosRequestConfig = {
    headers: new AxiosHeaders(),
  }
  const response: AxiosResponse | undefined = status === undefined
    ? undefined
    : {
        config,
        data,
        headers: new AxiosHeaders(),
        status,
        statusText: '',
      }

  return new AxiosError(
    'mensagem técnica que não pode aparecer',
    code,
    config,
    undefined,
    response,
  )
}

describe('getErrorMessage', () => {
  it('prioriza códigos estáveis e não expõe a mensagem do backend', () => {
    const error = createAxiosError(418, {
      code: 'INVALID_PHONE_NUMBER',
      message: 'Phone parsing stack trace',
    })

    const message = getErrorMessage(error)

    expect(message).toBe('Informe um telefone válido.')
    expect(message).not.toContain('Phone parsing')
  })

  it('usa feedback específico para credenciais inválidas', () => {
    expect(getErrorMessage(createAxiosError(401), 'authentication')).toBe(
      'E-mail ou senha inválidos. Confira os dados e tente novamente.',
    )
  })

  it.each([
    [400, 'Revise os dados informados e tente novamente.'],
    [401, 'Sua sessão expirou. Entre novamente para continuar.'],
    [403, 'Você não tem acesso para realizar esta ação.'],
    [404, 'O conteúdo solicitado não foi encontrado.'],
    [409, 'Não foi possível concluir porque os dados estão em conflito.'],
    [429, 'Muitas tentativas foram realizadas. Aguarde um momento e tente novamente.'],
    [503, 'O serviço está indisponível no momento. Tente novamente mais tarde.'],
  ])('traduz o status HTTP %i', (status, expected) => {
    expect(getErrorMessage(createAxiosError(status))).toBe(expected)
  })

  it('diferencia timeout de indisponibilidade de rede', () => {
    expect(getErrorMessage(createAxiosError(undefined, undefined, 'ECONNABORTED'))).toBe(
      'A solicitação demorou mais que o esperado. Tente novamente.',
    )
    expect(getErrorMessage(createAxiosError(undefined, undefined, 'ERR_NETWORK'))).toBe(
      'Não foi possível se conectar ao serviço. Verifique sua conexão e tente novamente.',
    )
  })

  it('não expõe mensagens de erros JavaScript desconhecidos', () => {
    expect(getErrorMessage(new Error('segredo de implementação'))).toBe(
      'Ocorreu um erro inesperado. Tente novamente.',
    )
  })
})

describe('isForbiddenError', () => {
  it('reconhece somente uma resposta Axios 403', () => {
    expect(isForbiddenError(createAxiosError(403))).toBe(true)
    expect(isForbiddenError(createAxiosError(401))).toBe(false)
    expect(isForbiddenError(new Error('403'))).toBe(false)
  })
})
