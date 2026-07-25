import { z } from "zod";

export const registerPresenceSchema = z.object({
  memberId: z.uuid("Selecione um membro."),
  observations: z
    .string()
    .trim()
    .max(2000, "As observações devem ter no máximo 2.000 caracteres."),
});

export const updatePresenceObservationsSchema = z.object({
  observations: z
    .string()
    .trim()
    .max(2000, "As observações devem ter no máximo 2.000 caracteres."),
});

export const removePresenceSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Informe o motivo da remoção.")
    .max(2000, "O motivo deve ter no máximo 2.000 caracteres."),
});

export type RegisterPresenceFormValues = z.infer<typeof registerPresenceSchema>;
export type UpdatePresenceObservationsFormValues = z.infer<
  typeof updatePresenceObservationsSchema
>;
export type RemovePresenceFormValues = z.infer<typeof removePresenceSchema>;
