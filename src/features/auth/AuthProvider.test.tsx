import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/http/accessToken'

import { AuthProvider } from './AuthProvider'
import { useAuth } from './hooks/useAuth'
import type { AccountSession } from './types'

const sessionMocks = vi.hoisted(() => ({
  establishSession: vi.fn(),
  getCurrentAccount: vi.fn(),
  logoutSession: vi.fn(),
  refreshSessionToken: vi.fn(),
}))

vi.mock('./api/session', () => sessionMocks)

class BroadcastChannelMock {
  static instances: BroadcastChannelMock[] = []

  readonly name: string
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null
  readonly close = vi.fn()
  readonly postMessage = vi.fn()

  constructor(name: string) {
    this.name = name
    BroadcastChannelMock.instances.push(this)
  }
}

const account: AccountSession = {
  displayName: 'Conta Autenticada',
  email: 'conta@example.test',
  id: '550e8400-e29b-41d4-a716-446655440000',
  permissions: ['MEMBER_SEARCH'],
  roles: [],
}

function AuthHarness() {
  const { account: currentAccount, logout, status } = useAuth()
  const [logoutConfirmed, setLogoutConfirmed] = useState<boolean | null>(null)

  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="account">{currentAccount?.displayName ?? 'sem conta'}</span>
      <span data-testid="logout-result">
        {logoutConfirmed === null ? 'não executado' : String(logoutConfirmed)}
      </span>
      <button
        type="button"
        onClick={() => void logout().then(setLogoutConfirmed)}
      >
        Sair
      </button>
    </div>
  )
}

function renderProvider(queryClient = new QueryClient()) {
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    </QueryClientProvider>,
  )

  return queryClient
}

beforeEach(() => {
  clearAccessToken()
  BroadcastChannelMock.instances = []
  vi.stubGlobal('BroadcastChannel', BroadcastChannelMock)
  sessionMocks.refreshSessionToken.mockResolvedValue({ token: 'token-bootstrap' })
  sessionMocks.getCurrentAccount.mockResolvedValue(account)
  sessionMocks.logoutSession.mockResolvedValue(undefined)
})

afterEach(() => {
  clearAccessToken()
  vi.unstubAllGlobals()
})

describe('AuthProvider', () => {
  it('só autentica depois de renovar o token e carregar a conta atual', async () => {
    sessionMocks.getCurrentAccount.mockImplementationOnce(async () => {
      expect(getAccessToken()).toBe('token-bootstrap')
      return account
    })

    renderProvider()

    expect(screen.getByTestId('status')).toHaveTextContent('initializing')
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
    })
    expect(screen.getByTestId('account')).toHaveTextContent('Conta Autenticada')
    expect(sessionMocks.refreshSessionToken).toHaveBeenCalledOnce()
    expect(sessionMocks.getCurrentAccount).toHaveBeenCalledOnce()
  })

  it('limpa token, conta e cache quando o bootstrap falha', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(['privado'], { segredo: true })
    setAccessToken('token-antigo')
    sessionMocks.refreshSessionToken.mockRejectedValueOnce(new Error('sem sessão'))

    renderProvider(queryClient)

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    })
    expect(screen.getByTestId('account')).toHaveTextContent('sem conta')
    expect(getAccessToken()).toBeNull()
    expect(queryClient.getQueryData(['privado'])).toBeUndefined()
  })

  it('limpa a sessão local e avisa outras abas mesmo sem confirmação do logout', async () => {
    sessionMocks.logoutSession.mockRejectedValueOnce(new Error('rede indisponível'))
    const user = userEvent.setup()
    renderProvider()
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
    })

    await user.click(screen.getByRole('button', { name: 'Sair' }))

    await waitFor(() => {
      expect(screen.getByTestId('logout-result')).toHaveTextContent('false')
    })
    expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    expect(getAccessToken()).toBeNull()
    expect(BroadcastChannelMock.instances[0]?.postMessage).toHaveBeenCalledWith('logout')
  })

  it('expira a sessão ao receber o evento efêmero de logout de outra aba', async () => {
    const queryClient = renderProvider()
    queryClient.setQueryData(['privado'], { segredo: true })
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
    })

    const channel = BroadcastChannelMock.instances[0]
    act(() => {
      channel?.onmessage?.(new MessageEvent('message', { data: 'logout' }))
    })

    expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    expect(screen.getByTestId('account')).toHaveTextContent('sem conta')
    expect(getAccessToken()).toBeNull()
    expect(queryClient.getQueryData(['privado'])).toBeUndefined()
  })
})
