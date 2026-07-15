import { useEffect, useState, useRef, type ReactNode } from 'react';
import { api, getErrorMessage, type ApiErrorResponse } from '@/lib/http';
import { RedirectFeedback } from './RedirectFeedback';
import { AxiosError } from 'axios';

interface ErrorConfig {
  isVisible: boolean;
  title: string;
  description: string;
  buttonText: string;
  redirectUrl: string;
  action?: () => void;
}

export const AxiosInterceptor = ({ children }: { children: ReactNode }) => {
  const [errorConfig, setErrorConfig] = useState<ErrorConfig>({
    isVisible: false,
    title: '',
    description: '',
    buttonText: 'Ok',
    redirectUrl: '/',
  });

  const interceptorId = useRef<number | null>(null);

  useEffect(() => {
    const id = api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorResponse>) => {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message;
        const requestUrl = error.config?.url;

        if (status === 401 && requestUrl?.includes('/auth/login')) {
          return Promise.reject(error);
        }

        if (status === 401) {
          localStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_token');

          setErrorConfig({
            isVisible: true,
            title: 'Sessão Expirada',
            description: errorMessage || getErrorMessage(error),
            buttonText: 'Ir para Login',
            redirectUrl: '/auth/login',
            action: () => {
              console.log('Redirecionando para login por 401 (Global)');
            }
          });
        }

        if (status === 403) {
          setErrorConfig({
            isVisible: true,
            title: 'Acesso Negado',
            description: errorMessage || getErrorMessage(error),
            buttonText: 'Voltar ao Início',
            redirectUrl: '/home',
            action: () => {
               console.log('Redirecionando para home por 403');
            }
          });
        }

        return Promise.reject(error);
      }
    );

    interceptorId.current = id;

    // Cleanup: Remove o interceptor ao desmontar o componente
    return () => {
      api.interceptors.response.eject(id);
    };
  }, []);

  const handleClose = () => {
     setErrorConfig(prev => ({ ...prev, isVisible: false }));
  };

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
            if (errorConfig.action) errorConfig.action();
            handleClose();
        }}
      />
    </>
  );
};
