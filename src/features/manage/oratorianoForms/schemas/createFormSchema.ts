import { z } from 'zod'

export const createOratorianoFormSchema = z.object({
  origin: z.enum(['PAPER_TRANSCRIPTION', 'DIRECT_SYSTEM_ENTRY'], {
    error: 'Escolha como esta ficha será preenchida.',
  }),
})

export type CreateOratorianoFormValues = z.infer<
  typeof createOratorianoFormSchema
>
