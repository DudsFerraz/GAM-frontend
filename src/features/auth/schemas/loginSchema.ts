import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Digite um e-mail válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
  rememberMe: z.boolean().default(true).optional(),
})

export type LoginFormValues = z.infer<typeof loginSchema>

