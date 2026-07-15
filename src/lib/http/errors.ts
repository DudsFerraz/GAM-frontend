import { AxiosError } from 'axios';
import type { ApiErrorResponse } from './types';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;

    if (data && data.message) {
      return data.message;
    }

    switch (error.response?.status) {
      case 401: return "Sessão expirada ou credenciais inválidas.";
      case 403: return "Você não tem permissão para realizar esta ação.";
      case 404: return "Recurso não encontrado no servidor.";
      case 500: return "Erro interno no servidor.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
};
