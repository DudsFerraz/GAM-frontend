import type { components } from '@/api/generated/gam-api'
import { api } from '@/lib/http'
import { clearAccessToken, setAccessToken } from '@/lib/http/accessToken'

import type { AccountSession, LoginInfo, LoginResponse } from '../types'

type CsrfProof = components['schemas']['CsrfBootstrapRDTO']
type LoginTransport = components['schemas']['LoginAccountRDTO']

let refreshRequest: Promise<LoginResponse> | null = null

async function getCsrfProof(): Promise<CsrfProof> {
  const { data } = await api.get<CsrfProof>('/auth/csrf')

  if (!data.token || !data.headerName) {
    throw new Error('O backend retornou uma prova CSRF inválida.')
  }

  return data
}

async function postWithCsrf<T>(path: '/auth/login' | '/auth/refresh' | '/auth/logout', body?: LoginInfo): Promise<T> {
  const csrf = await getCsrfProof()
  const { data } = await api.post<T>(path, body, {
    headers: { [csrf.headerName]: csrf.token },
  })
  return data
}

function requireAccessToken(response: LoginTransport): LoginResponse {
  if (!response.token) {
    throw new Error('O backend não retornou um token de acesso.')
  }

  return { token: response.token }
}

export async function loginSession(info: LoginInfo): Promise<LoginResponse> {
  const response = await postWithCsrf<LoginTransport>('/auth/login', info)
  return requireAccessToken(response)
}

// Refreshes the session token by making a POST request to the /auth/refresh endpoint.
// If a refresh request is already in progress, it returns the existing promise instead of creating a new one.
// Once the request completes (either successfully or with an error), the stored promise is cleared to allow future refresh attempts.
export function refreshSessionToken(): Promise<LoginResponse> {
  if (refreshRequest) return refreshRequest

  refreshRequest = postWithCsrf<LoginTransport>('/auth/refresh')
    .then(requireAccessToken)
    .finally(() => {
      refreshRequest = null
    })

  return refreshRequest
}

export async function logoutSession(): Promise<void> {
  await postWithCsrf<string>('/auth/logout')
}

export async function getCurrentAccount(): Promise<AccountSession> {
  const { data } = await api.get<AccountSession>('/accounts/me')
  return data
}

export async function establishSession(info: LoginInfo): Promise<AccountSession> {
  const { token } = await loginSession(info)
  setAccessToken(token)

  try {
    return await getCurrentAccount()
  } catch (error) {
    clearAccessToken()
    throw error
  }
}
