import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useEffect, useState, type ReactNode } from 'react'

import { api, getErrorMessage, type ApiErrorResponse } from '@/lib/http'
import { getAccessToken } from '@/lib/http/accessToken'

import { useAuth } from '../hooks/useAuth'
import { RedirectFeedback } from './RedirectFeedback'

interface ErrorConfig {
  isVisible: boolean;
  title: string;
  description: string;
  buttonText: string;
  redirectUrl: string;
  action?: () => void;
}

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _accountSynchronizationAttempted?: boolean
  _authRetry?: boolean
}

const AUTH_SESSION_PATHS = [
  '/auth/csrf',
  '/auth/login',
  '/auth/logout',
  '/auth/refresh',
  '/auth/register',
  '/accounts/me',
]

export const AxiosInterceptor = ({ children }: { children: ReactNode }) => {
  const { expire, refresh, synchronizeAccount } = useAuth()
  const [errorConfig, setErrorConfig] = useState<ErrorConfig>({
    isVisible: false,
    title: '',
    description: '',
    buttonText: 'Ok',
    redirectUrl: '/',
  })

  useEffect(() => {
    const id = api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url;
        const requestConfig = error.config as RetriableRequestConfig | undefined;
        const isSessionRequest = AUTH_SESSION_PATHS.some((path) => requestUrl?.includes(path));

        if (isSessionRequest) {
          return Promise.reject(error)
        }

        if (status === 401 && requestConfig && !requestConfig._authRetry) {
          requestConfig._authRetry = true

          try {
            await refresh();
            const token = getAccessToken();
            if (token) requestConfig.headers.Authorization = `Bearer ${token}`;
            return api.request(requestConfig)
          } catch {
            // The refresh path already cleared the in-memory session.
          }
        }

        if (status === 401) {
          expire()

          setErrorConfig({
            isVisible: true,
            title: 'Sessão Expirada',
            description: getErrorMessage(error),
            buttonText: 'Entrar novamente',
            redirectUrl: '/auth/login',
          })
        }

        if (status === 403) {
          if (requestConfig && !requestConfig._accountSynchronizationAttempted) {
            requestConfig._accountSynchronizationAttempted = true
            await synchronizeAccount().catch(() => undefined)
          }

          setErrorConfig({
            isVisible: true,
            title: 'Acesso Negado',
            description: getErrorMessage(error),
            buttonText: 'Voltar ao Início',
            redirectUrl: '/home',
          })
        }

        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.response.eject(id);
    }
  }, [expire, refresh, synchronizeAccount])

  const handleClose = () => {
    setErrorConfig((previous) => ({ ...previous, isVisible: false }))
  }

  return (
    <>
      {children}
      <RedirectFeedback
        isVisible={errorConfig.isVisible}
        title={errorConfig.title}
        description={errorConfig.description}
        buttonText={errorConfig.buttonText}
        redirectUrl={errorConfig.redirectUrl}
        onAction={() => {
            if (errorConfig.action) errorConfig.action()
            handleClose()
        }}
      />
    </>
  );
};
