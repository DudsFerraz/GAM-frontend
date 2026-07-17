import { z } from 'zod'

const reason = z.string().trim().min(1, 'Informe o motivo da alteração.').max(2000, 'O motivo deve ter no máximo 2.000 caracteres.')

export const assignRoleSchema = z.object({ roleId: z.uuid('Informe um identificador de papel válido.'), reason })
export const dropRoleSchema = z.object({ reason })
export const assignmentLookupSchema = z.object({ assignmentId: z.uuid('Informe um identificador de vínculo válido.') })

export type AssignRoleValues = z.infer<typeof assignRoleSchema>
export type DropRoleValues = z.infer<typeof dropRoleSchema>
export type AssignmentLookupValues = z.infer<typeof assignmentLookupSchema>
