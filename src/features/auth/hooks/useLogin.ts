import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import type { LoginInfo } from '../types';
import { useAuth } from './useAuth';

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: LoginInfo) => login(data),
    
    onSuccess: () => {
      navigate({ to: '/home' });
    },
  });
};
