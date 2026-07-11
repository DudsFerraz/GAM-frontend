import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { getUserIdFromToken, clearToken  } from '../features/auth/util';
import { getMainRoleLabel } from '@/utils/getMainRoleLabel';
import type { AccountResponse } from '@/types/api';
import { api } from '@/lib/axios';
import type { UUID } from "@/utils/global"

export const getAccount = async (id: UUID): Promise<AccountResponse> => {
  const { data } = await api.get<AccountResponse>(`/account/${id}`);
  return data;
};

export const useGetAccountInfo = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = getUserIdFromToken();

  const { data: accountData, isLoading } = useQuery({
    queryKey: ['auth', 'user', userId],
    queryFn: () => getAccount(userId!),
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
        roleLabel: getMainRoleLabel(accountData.roles.roles), 
        picture: accountData.picture || null
    } : null,
    
    account: accountData || null,
    
    isLoading,
    isAuthenticated: !!accountData,
    logout
  };
};