import type { components } from '@/api/generated/gam-api'

export type RegisterInfo = components['schemas']['RegisterAccountDTO']
export type RegisterResponse = components['schemas']['RegisterAccountRDTO']
export type LoginInfo = components['schemas']['LoginAccountDTO']
export type AccountSession = components['schemas']['CurrentAccountContextRDTO']
export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated'

export type LoginResponse = {
  token: string
}
