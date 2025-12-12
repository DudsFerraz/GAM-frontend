import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { login } from '../api/login';

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      
      // 2. (Opcional) Salvar dados do usuário em um store global (Zustand/Context)
      // localStorage.setItem('user_data', JSON.stringify(data.user));

      navigate({ to: '/home' });
    },
    onError: (error) => {
      console.error('Falha no login:', error);
      // disparar um Toast do shadcn avisando o erro
    },
  });
};