import { createContext } from 'react'

import type { AccountSession, AuthStatus, LoginInfo } from './types'

export type AuthContextValue = {
  account: AccountSession | null
  status: AuthStatus
  login: (info: LoginInfo) => Promise<void>
  logout: () => Promise<boolean>
  refresh: () => Promise<void>
  synchronizeAccount: () => Promise<void>
  expire: () => void
  hasUnconfirmedLogout: boolean
  dismissUnconfirmedLogout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
