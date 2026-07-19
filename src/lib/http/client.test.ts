import {
  AxiosHeaders,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { clearAccessToken, setAccessToken } from './accessToken'
import { api } from './client'

function createAdapter() {
  return vi.fn<AxiosAdapter>(async (config: InternalAxiosRequestConfig) => ({
    config,
    data: null,
    headers: new AxiosHeaders(),
    status: 200,
    statusText: 'OK',
  }))
}

afterEach(() => {
  clearAccessToken()
})

describe('shared HTTP client', () => {
  it('mantém as requisições no prefixo público relativo e envia cookies', () => {
    expect(api.defaults.baseURL).toBe('/api')
    expect(api.defaults.withCredentials).toBe(true)
  })

  it('anexa o token mantido em memória', async () => {
    const adapter = createAdapter()
    setAccessToken('token-em-memória')

    await api.get('/members', { adapter })

    const config = adapter.mock.calls[0]?.[0]
    expect(config?.baseURL).toBe('/api')
    expect(config?.headers.Authorization).toBe('Bearer token-em-memória')
  })

  it('não envia Authorization depois que a sessão é limpa', async () => {
    const adapter = createAdapter()
    setAccessToken('token-antigo')
    clearAccessToken()

    await api.get('/members', { adapter })

    expect(adapter.mock.calls[0]?.[0].headers.Authorization).toBeUndefined()
  })
})
