import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { clearAccessToken, setAccessToken } from '@/lib/http/accessToken'

import { establishSession, getCurrentAccount, logoutSession, refreshSessionToken } from './api/session'
import { AuthContext, type AuthContextValue } from './authContext'
import type { AccountSession, AuthStatus, LoginInfo } from './types'

const SESSION_CHANNEL = 'gam-auth-session'
const REFRESH_LOCK = 'gam-auth-refresh'

type SessionEvent =
  | 'logout'
  | { type: 'refresh-start'; id: string }
  | { type: 'refresh-succeeded'; id: string; token: string }
  | { type: 'refresh-failed'; id: string }

type PendingRemoteRefresh = {
  id: string
  promise: Promise<string>
  resolve: (token: string) => void
  reject: (reason?: unknown) => void
}

type BrowserLockManager = {
  request: <T>(
    name: string,
    options: { mode: 'exclusive' },
    callback: () => T | Promise<T>,
  ) => Promise<Awaited<T>>
}

function createPendingRemoteRefresh(id: string): PendingRemoteRefresh {
  let resolve: (token: string) => void = () => undefined
  let reject: (reason?: unknown) => void = () => undefined
  const promise = new Promise<string>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  // A remote attempt can fail before this tab starts waiting for it.
  void promise.catch(() => undefined)

  return { id, promise, reject, resolve }
}

function isSessionEvent(value: unknown): value is SessionEvent {
  if (value === 'logout') return true
  if (typeof value !== 'object' || value === null || !('type' in value) || !('id' in value)) {
    return false
  }

  if (value.type === 'refresh-start' || value.type === 'refresh-failed') {
    return typeof value.id === 'string'
  }

  return value.type === 'refresh-succeeded'
    && typeof value.id === 'string'
    && 'token' in value
    && typeof value.token === 'string'
}

function withRefreshLock<T>(callback: () => Promise<T>): Promise<T> {
  if (typeof navigator === 'undefined') return callback()

  const locks = (navigator as Navigator & { locks?: BrowserLockManager }).locks
  return locks ? locks.request<T>(REFRESH_LOCK, { mode: 'exclusive' }, callback) : callback()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AuthStatus>('initializing')
  const [account, setAccount] = useState<AccountSession | null>(null)
  const [hasUnconfirmedLogout, setHasUnconfirmedLogout] = useState(false)
  const refreshPromise = useRef<Promise<void> | null>(null)
  const accountSynchronizationPromise = useRef<Promise<void> | null>(null)
  const channel = useRef<BroadcastChannel | null>(null)
  const remoteRefresh = useRef<PendingRemoteRefresh | null>(null)
  const refreshSequence = useRef(0)

  const expire = useCallback(() => {
    clearAccessToken()
    setAccount(null)
    setStatus('unauthenticated')
    // remove all queries from the cache to ensure that no stale data is used after logout
    queryClient.removeQueries()
  }, [queryClient])

  const synchronizeAccount = useCallback(() => {
    if (accountSynchronizationPromise.current) {
      return accountSynchronizationPromise.current
    }

    const request = getCurrentAccount()
      .then((currentAccount) => {
        setAccount(currentAccount)
        setStatus('authenticated')
      })
      .finally(() => {
        accountSynchronizationPromise.current = null
      })

    accountSynchronizationPromise.current = request
    return request
  }, [])

  const postSessionEvent = useCallback((event: SessionEvent) => {
    channel.current?.postMessage(event)
  }, [])

  const waitForRemoteRefresh = useCallback(async (pendingRefresh: PendingRemoteRefresh) => {
    const token = await pendingRefresh.promise
    setAccessToken(token)
    await synchronizeAccount()
  }, [synchronizeAccount])

  const refresh = useCallback(() => {
    if (refreshPromise.current) return refreshPromise.current

    const request = (async () => {
      try {
        const pendingRefresh = remoteRefresh.current
        if (pendingRefresh) {
          await waitForRemoteRefresh(pendingRefresh)
          return
        }

        await withRefreshLock(async () => {
          const pendingAfterLock = remoteRefresh.current
          if (pendingAfterLock) {
            await waitForRemoteRefresh(pendingAfterLock)
            return
          }

          const id = `refresh-${Date.now()}-${refreshSequence.current++}`
          postSessionEvent({ type: 'refresh-start', id })

          try {
            const { token } = await refreshSessionToken()
            setAccessToken(token)
            await synchronizeAccount()
            postSessionEvent({ type: 'refresh-succeeded', id, token })
          } catch (error) {
            postSessionEvent({ type: 'refresh-failed', id })
            throw error
          }
        })
      } catch (error) {
        expire()
        throw error
      } finally {
        refreshPromise.current = null
      }
    })()

    refreshPromise.current = request
    return request
  }, [expire, postSessionEvent, synchronizeAccount, waitForRemoteRefresh])

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return

    const authChannel = new BroadcastChannel(SESSION_CHANNEL)
    authChannel.onmessage = (event: MessageEvent<unknown>) => {
      if (!isSessionEvent(event.data)) return

      if (event.data === 'logout') {
        expire()
        return
      }

      if (event.data.type === 'refresh-start') {
        remoteRefresh.current = createPendingRemoteRefresh(event.data.id)
        return
      }

      const pendingRefresh = remoteRefresh.current
      if (!pendingRefresh || pendingRefresh.id !== event.data.id) return

      remoteRefresh.current = null
      if (event.data.type === 'refresh-succeeded') {
        pendingRefresh.resolve(event.data.token)
        return
      }

      pendingRefresh.reject(new Error('A renovação da sessão em outra aba não foi concluída.'))
    }
    channel.current = authChannel

    return () => {
      authChannel.close()
      channel.current = null
    }
  }, [expire])

  useEffect(() => {
    void refresh().catch(() => undefined)
  }, [refresh])

  const login = useCallback(async (info: LoginInfo) => {
    queryClient.removeQueries()
    const currentAccount = await establishSession(info)
    setAccount(currentAccount)
    setStatus('authenticated')
    setHasUnconfirmedLogout(false)
  }, [queryClient])

  const logout = useCallback(async () => {
    let confirmed = true

    try {
      await logoutSession()
    } catch {
      confirmed = false
    } finally {
      expire()
      channel.current?.postMessage('logout')
    }

    setHasUnconfirmedLogout(!confirmed)
    return confirmed
  }, [expire])

  const dismissUnconfirmedLogout = useCallback(() => {
    setHasUnconfirmedLogout(false)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    account,
    status,
    login,
    logout,
    refresh,
    synchronizeAccount,
    expire,
    hasUnconfirmedLogout,
    dismissUnconfirmedLogout,
  }), [
    account,
    dismissUnconfirmedLogout,
    expire,
    hasUnconfirmedLogout,
    login,
    logout,
    refresh,
    status,
    synchronizeAccount,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
