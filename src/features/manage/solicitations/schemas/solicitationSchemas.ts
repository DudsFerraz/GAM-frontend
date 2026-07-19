import { z } from 'zod'

function isEligibleBirthDate(value: string): boolean {
  const birthDate = new Date(`${value}T12:00:00`)
  const threshold = new Date()
  threshold.setFullYear(threshold.getFullYear() - 17)
  return !Number.isNaN(birthDate.getTime()) && birthDate <= threshold
}

export const solicitationSchema = z.object({
  firstName: z.string().trim().min(1, 'Informe o nome.').max(100, 'O nome deve ter no máximo 100 caracteres.'),
  surname: z.string().trim().min(1, 'Informe o sobrenome.').max(150, 'O sobrenome deve ter no máximo 150 caracteres.'),
  birthDate: z.string().min(1, 'Informe a data.').refine(isEligibleBirthDate, 'É necessário ter pelo menos 17 anos.'),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+\d{2} \(\d{2}\) \d{4,5}-\d{4}$/, 'Informe um telefone válido, como +55 (19) 99999-9999.'),
  justification: z.string().trim().min(1, 'Informe sua justificativa.').max(2000, 'A justificativa deve ter no máximo 2.000 caracteres.'),
})

export const reviewSchema = z.object({
  reason: z.string().trim().min(1, 'Informe o motivo da decisão.').max(2000, 'O motivo deve ter no máximo 2.000 caracteres.'),
})

export type SolicitationFormValues = z.infer<typeof solicitationSchema>
export type ReviewFormValues = z.infer<typeof reviewSchema>
