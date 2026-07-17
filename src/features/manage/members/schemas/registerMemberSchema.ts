import { z } from 'zod'

function isAtLeastSeventeen(value: string): boolean {
  const birthDate = new Date(`${value}T12:00:00`)
  if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) {
    return false
  }

  const threshold = new Date()
  threshold.setFullYear(threshold.getFullYear() - 17)
  return birthDate <= threshold
}

export const registerMemberSchema = z.object({
  accountId: z.uuid('Selecione uma conta válida.'),
  firstName: z.string().trim().min(1, 'Informe o nome.').max(100, 'O nome deve ter no máximo 100 caracteres.'),
  surname: z.string().trim().min(1, 'Informe o sobrenome.').max(150, 'O sobrenome deve ter no máximo 150 caracteres.'),
  birthDate: z
    .string()
    .min(1, 'Informe a data de nascimento.')
    .refine(isAtLeastSeventeen, 'A pessoa deve ter pelo menos 17 anos.'),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{7,14}$/, 'Use o formato internacional, como +5519999999999.'),
  reason: z.string().trim().min(1, 'Informe o motivo.').max(2000, 'O motivo deve ter no máximo 2.000 caracteres.'),
})

export type RegisterMemberFormValues = z.infer<typeof registerMemberSchema>
