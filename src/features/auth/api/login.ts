import { api } from '@/lib/axios';
import type { LoginInfo, LoginResponse } from '../types';

export const login = async (info: LoginInfo): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/auth/login', info);
  return data;
};