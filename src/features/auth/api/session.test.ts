import { beforeEach, describe, expect, it, vi } from 'vitest'

import { clearAccessToken, getAccessToken } from '@/lib/http/accessToken'

import type { AccountSession } from '../types'
import {
  establishSession,
  loginSession,
  refreshSessionToken,
} from './session'

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock('@/lib/http', () => ({ api: apiMocks }))

const csrfProof = {
  headerName: 'X-XSRF-TOKEN',
  token: 'prova-csrf',
}

const account: AccountSession = {
  displayName: 'Conta GAM',
  email: 'conta@example.test',
  id: '550e8400-e29b-41d4-a716-446655440000',
  permissions: ['MEMBER_SEARCH'],
  roles: [],
}

beforeEach(() => {
  apiMocks.get.mockReset()
  apiMocks.post.mockReset()
  clearAccessToken()
})

describe('loginSession', () => {
  it('obtém uma prova CSRF e a envia no cabeçalho indicado pelo backend', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: csrfProof })
    apiMocks.post.mockResolvedValueOnce({ data: { token: 'token-login' } })
    const credentials = { email: 'conta@example.test', password: 'segredo' }

    await expect(loginSession(credentials)).resolves.toEqual({ token: 'token-login' })

    expect(apiMocks.get).toHaveBeenCalledWith('/auth/csrf')
    expect(apiMocks.post).toHaveBeenCalledWith('/auth/login', credentials, {
      headers: { 'X-XSRF-TOKEN': 'prova-csrf' },
    })
  })

  it('interrompe a operação quando a prova CSRF é inválida', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { headerName: '', token: '' } })

    await expect(
      loginSession({ email: 'conta@example.test', password: 'segredo' }),
    ).rejects.toThrow('prova CSRF inválida')
    expect(apiMocks.post).not.toHaveBeenCalled()
  })

  it('rejeita uma resposta sem token de acesso', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: csrfProof })
    apiMocks.post.mockResolvedValueOnce({ data: {} })

    await expect(
      loginSession({ email: 'conta@example.test', password: 'segredo' }),
    ).rejects.toThrow('não retornou um token de acesso')
  })
})

describe('refreshSessionToken', () => {
  it('compartilha uma única requisição de refresh concorrente', async () => {
    let releaseCsrf: (value: { data: typeof csrfProof }) => void = () => undefined
    const pendingCsrf = new Promise<{ data: typeof csrfProof }>((resolve) => {
      releaseCsrf = resolve
    })
    apiMocks.get.mockReturnValueOnce(pendingCsrf)
    apiMocks.post.mockResolvedValueOnce({ data: { token: 'token-renovado' } })

    const firstRefresh = refreshSessionToken()
    const secondRefresh = refreshSessionToken()
    releaseCsrf({ data: csrfProof })

    expect(secondRefresh).toBe(firstRefresh)
    await expect(firstRefresh).resolves.toEqual({ token: 'token-renovado' })
    expect(apiMocks.get).toHaveBeenCalledOnce()
    expect(apiMocks.post).toHaveBeenCalledOnce()
  })

  it('libera uma nova tentativa depois de uma falha', async () => {
    apiMocks.get.mockRejectedValueOnce(new Error('indisponível'))

    await expect(refreshSessionToken()).rejects.toThrow('indisponível')

    apiMocks.get.mockResolvedValueOnce({ data: csrfProof })
    apiMocks.post.mockResolvedValueOnce({ data: { token: 'nova-tentativa' } })
    await expect(refreshSessionToken()).resolves.toEqual({ token: 'nova-tentativa' })
    expect(apiMocks.get).toHaveBeenCalledTimes(2)
  })
})

describe('establishSession', () => {
  it('mantém o token somente em memória e carrega a conta atual', async () => {
    apiMocks.get
      .mockResolvedValueOnce({ data: csrfProof })
      .mockResolvedValueOnce({ data: account })
    apiMocks.post.mockResolvedValueOnce({ data: { token: 'token-da-sessão' } })

    await expect(
      establishSession({ email: 'conta@example.test', password: 'segredo' }),
    ).resolves.toEqual(account)
    expect(getAccessToken()).toBe('token-da-sessão')
    expect(apiMocks.get).toHaveBeenNthCalledWith(2, '/accounts/me')
  })

  it('remove o token quando a conta atual não pode ser carregada', async () => {
    apiMocks.get
      .mockResolvedValueOnce({ data: csrfProof })
      .mockRejectedValueOnce(new Error('sessão inválida'))
    apiMocks.post.mockResolvedValueOnce({ data: { token: 'token-inválido' } })

    await expect(
      establishSession({ email: 'conta@example.test', password: 'segredo' }),
    ).rejects.toThrow('sessão inválida')
    expect(getAccessToken()).toBeNull()
  })
})
