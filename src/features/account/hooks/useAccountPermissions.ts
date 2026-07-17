import type { AccountResponse } from '../types';

export const useAccountPermissions = (user: AccountResponse | null) => {
  return {
    permissions: user?.permissions ?? [],
  };
};
