import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { clearAccessToken, setAccessToken } from '@/lib/http/accessToken'

import { establishSession, getCurrentAccount, logoutSession, refreshSessionToken } from './api/session'
import { AuthContext, type AuthContextValue } from './authContext'
import type { AccountSession, AuthStatus, LoginInfo } from './types'

const SESSION_CHANNEL = 'gam-auth-session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AuthStatus>('initializing')
  const [account, setAccount] = useState<AccountSession | null>(null)
  // A ref to store the promise returned by the refresh function. This allows us to avoid making multiple refresh requests simultaneously.
  const refreshPromise = useRef<Promise<void> | null>(null)
  // A ref to store the BroadcastChannel instance. 
  // This allows us to send messages to other tabs when the user logs out.
  const channel = useRef<BroadcastChannel | null>(null)

  const expire = useCallback(() => {
    clearAccessToken()
    setAccount(null)
    setStatus('unauthenticated')
    // remove all queries from the cache to ensure that no stale data is used after logout
    queryClient.removeQueries()
  }, [queryClient])

  const refresh = useCallback(() => {
    // Verifies if a refresh request is already in progress. If so, it returns the existing promise instead of creating a new one.
    if (refreshPromise.current) return refreshPromise.current

    // If no refresh request is in progress, it creates a new one. 
    // The request attempts to refresh the session token and update the account information. If it fails, it calls the expire function to clear the session.
    const request = (async () => {
      try {
        const { token } = await refreshSessionToken()
        setAccessToken(token)
        const currentAccount = await getCurrentAccount()
        setAccount(currentAccount)
        setStatus('authenticated')
      } catch (error) {
        expire()
        throw error
      } finally {
        // Regardless of whether the refresh request succeeds or fails, 
        // it clears the stored promise to allow future refresh attempts.
        refreshPromise.current = null
      }
    })()

    refreshPromise.current = request
    return request
  }, [expire])

  // The first useEffect hook is used to attempt a session refresh when the component mounts.
  useEffect(() => {
    void refresh().catch(() => undefined)
  }, [refresh])

  // The second useEffect hook sets up a BroadcastChannel to listen for 
  // logout messages from other tabs.
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return

    // When a logout message is received, it calls the expire function to clear the session in the current tab.
    const authChannel = new BroadcastChannel(SESSION_CHANNEL)
    authChannel.onmessage = (event: MessageEvent<unknown>) => {
      if (event.data === 'logout') expire()
    }
    channel.current = authChannel

    return () => {
      authChannel.close()
      channel.current = null
    }
  }, [expire])

  const login = useCallback(async (info: LoginInfo) => {
    // Clear cache
    queryClient.removeQueries()
    // Establish session and set account
    const currentAccount = await establishSession(info)
    setAccount(currentAccount)
    setStatus('authenticated')
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

    return confirmed
  }, [expire])

  const value = useMemo<AuthContextValue>(() => ({
    account,
    status,
    login,
    logout,
    refresh,
    expire,
  }), [account, expire, login, logout, refresh, status])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
