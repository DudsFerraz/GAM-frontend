import { z } from 'zod'

export const registerSchema = z
  .object({
    displayName: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    email: z.email('Digite um e-mail válido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

