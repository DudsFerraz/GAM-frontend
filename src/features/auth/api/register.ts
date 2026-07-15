import { api } from '@/lib/http';
import type { RegisterInfo, RegisterResponse } from '../types'

export const register = async (info: RegisterInfo): Promise<RegisterResponse> => {
    const {data} = await api.post<RegisterResponse>('auth/register', info);
    return data 
}
