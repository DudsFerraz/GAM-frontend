import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { login } from '../api/login';
import type { LoginInfo } from '../types';

interface LoginVariables extends LoginInfo {
  rememberMe?: boolean;
}

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginVariables) => login(data),
    
    onSuccess: (data, variables) => {      
      const token = data.token;
      const storage = variables.rememberMe ? localStorage : sessionStorage;

      storage.setItem('auth_token', token);

      navigate({ to: '/home' });
    },
  });
};