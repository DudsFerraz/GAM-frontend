import { createContext } from 'react'

import type { AccountSession, AuthStatus, LoginInfo } from './types'

export type AuthContextValue = {
  account: AccountSession | null
  status: AuthStatus
  login: (info: LoginInfo) => Promise<void>
  logout: () => Promise<boolean>
  refresh: () => Promise<void>
  expire: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
