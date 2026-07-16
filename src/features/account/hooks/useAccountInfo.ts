import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { clearToken, getUserIdFromToken } from '@/features/auth';
import { getAccount } from '../api/getAccount';
import { getMainRoleLabel } from '../getMainRoleLabel';

export const useAccountInfo = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = getUserIdFromToken();

  const { data: accountData, isLoading } = useQuery({
    queryKey: ['auth', 'user', userId],
    queryFn: () => {
      if (!userId) {
        throw new Error('Cannot load an account without an account id');
      }

      return getAccount(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30,
    retry: false,
  });

  const logout = () => {
    clearToken();
    queryClient.removeQueries({ queryKey: ['auth'] });
    navigate({ to: '/auth/login' });
  };

  return {
    user: accountData ? {
        name: accountData.displayName,
        roleLabel: getMainRoleLabel(accountData.roles), 
        picture: accountData.picture || null
    } : null,
    
    account: accountData || null,
    
    isLoading,
    isAuthenticated: !!accountData,
    logout
  };
};
