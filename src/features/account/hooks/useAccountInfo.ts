import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth';
import { getMainRoleLabel } from '../getMainRoleLabel';

export const useAccountInfo = () => {
  const navigate = useNavigate();
  const { account, status, logout: endSession } = useAuth();

  const logout = async () => {
    await endSession();
    await navigate({ to: '/auth/login' });
  };

  return {
    user: account ? {
        name: account.displayName,
        roleLabel: getMainRoleLabel(account.roles),
        picture: null
    } : null,

    account,

    isLoading: status === 'initializing',
    isAuthenticated: status === 'authenticated',
    logout
  };
};
