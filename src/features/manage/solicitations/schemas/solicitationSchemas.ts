import { z } from 'zod'

function isEligibleBirthDate(value: string): boolean {
  const birthDate = new Date(`${value}T12:00:00`)
  const threshold = new Date()
  threshold.setFullYear(threshold.getFullYear() - 17)
  return !Number.isNaN(birthDate.getTime()) && birthDate <= threshold
}

export const solicitationSchema = z.object({
  firstName: z.string().trim().min(1, 'Informe o nome.').max(100),
  surname: z.string().trim().min(1, 'Informe o sobrenome.').max(150),
  birthDate: z.string().min(1, 'Informe a data.').refine(isEligibleBirthDate, 'É necessário ter pelo menos 17 anos.'),
  phoneNumber: z.string().trim().regex(/^\+[1-9]\d{7,14}$/, 'Use o formato internacional, como +5519999999999.'),
  justification: z.string().trim().min(1, 'Informe sua justificativa.').max(2000),
})

export const reviewSchema = z.object({
  reason: z.string().trim().min(1, 'Informe o motivo da decisão.').max(2000),
})

export type SolicitationFormValues = z.infer<typeof solicitationSchema>
export type ReviewFormValues = z.infer<typeof reviewSchema>
