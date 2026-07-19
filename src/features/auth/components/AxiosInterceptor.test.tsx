import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios'
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/lib/http'
import { clearAccessToken, setAccessToken } from '@/lib/http/accessToken'

import { AxiosInterceptor } from './AxiosInterceptor'

const authMocks = vi.hoisted(() => ({
  expire: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => authMocks,
}))

vi.mock('./RedirectFeedback', () => ({
  RedirectFeedback: ({
    description,
    isVisible,
    title,
  }: {
    description: string
    isVisible: boolean
    title: string
  }) => isVisible ? <div role="alert">{title}: {description}</div> : null,
}))

function createResponse(config: InternalAxiosRequestConfig) {
  return {
    config,
    data: { ok: true },
    headers: new AxiosHeaders(),
    status: 200,
    statusText: 'OK',
  }
}

function createHttpError(config: InternalAxiosRequestConfig, status: number) {
  return new AxiosError(
    'mensagem técnica',
    undefined,
    config,
    undefined,
    {
      config,
      data: { code: status === 403 ? 'FORBIDDEN' : 'UNAUTHORIZED' },
      headers: new AxiosHeaders(),
      status,
      statusText: '',
    },
  )
}

function renderInterceptor() {
  render(
    <AxiosInterceptor>
      <span>Conteúdo protegido</span>
    </AxiosInterceptor>,
  )
}

async function ignoreRejectedRequest(request: Promise<unknown>) {
  await act(async () => {
    await request.catch(() => undefined)
  })
}

beforeEach(() => {
  clearAccessToken()
  authMocks.refresh.mockResolvedValue(undefined)
})

describe('AxiosInterceptor', () => {
  it('renova e repete uma requisição protegida uma única vez após 401', async () => {
    setAccessToken('token-antigo')
    authMocks.refresh.mockImplementationOnce(async () => {
      setAccessToken('token-renovado')
    })
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      if (adapter.mock.calls.length === 1) {
        throw createHttpError(config, 401)
      }
      return createResponse(config)
    })
    renderInterceptor()

    await expect(api.get('/members', { adapter })).resolves.toMatchObject({ status: 200 })

    expect(authMocks.refresh).toHaveBeenCalledOnce()
    expect(adapter).toHaveBeenCalledTimes(2)
    expect(adapter.mock.calls[1]?.[0].headers.Authorization).toBe('Bearer token-renovado')
    expect(authMocks.expire).not.toHaveBeenCalled()
  })

  it('não repete indefinidamente quando a resposta continua sendo 401', async () => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      throw createHttpError(config, 401)
    })
    renderInterceptor()

    await ignoreRejectedRequest(api.get('/members', { adapter }))

    expect(adapter).toHaveBeenCalledTimes(2)
    expect(authMocks.refresh).toHaveBeenCalledOnce()
    expect(authMocks.expire).toHaveBeenCalledOnce()
    expect(screen.getByRole('alert')).toHaveTextContent('Sessão Expirada')
  })

  it('preserva 403 sem tentar renovar a sessão', async () => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      throw createHttpError(config, 403)
    })
    renderInterceptor()

    await ignoreRejectedRequest(api.get('/members', { adapter }))

    expect(authMocks.refresh).not.toHaveBeenCalled()
    expect(authMocks.expire).not.toHaveBeenCalled()
    expect(adapter).toHaveBeenCalledOnce()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Acesso Negado: Você não tem acesso para realizar esta ação.',
    )
  })

  it('deixa os endpoints de sessão tratarem o próprio 401', async () => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      throw createHttpError(config, 401)
    })
    renderInterceptor()

    await ignoreRejectedRequest(api.post('/auth/refresh', undefined, { adapter }))

    expect(authMocks.refresh).not.toHaveBeenCalled()
    expect(authMocks.expire).not.toHaveBeenCalled()
    expect(adapter).toHaveBeenCalledOnce()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
