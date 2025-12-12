import { api } from '@/lib/axios';
import type { RegisterInfo, RegisterResponse } from '../types'

export const register = async (info: RegisterInfo): Promise<RegisterResponse> => {
    const {data} = await api.post<RegisterResponse>('auth/register', info);
    return data 
}