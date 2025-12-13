import { useMutation } from '@tanstack/react-query';
import type { RegisterInfo } from '../types'
import { register } from '../api/register'

export const useRegister = () => {
    
    return useMutation({
        mutationFn: (data: RegisterInfo) => register(data),
    });

};