import { describe, expect, it } from "vitest";

import {
  registerPresenceSchema,
  removePresenceSchema,
  updatePresenceObservationsSchema,
} from "./presenceSchemas";

describe("esquemas de presença", () => {
  it("exige uma seleção interna válida sem pedir identificador à pessoa", () => {
    const result = registerPresenceSchema.safeParse({
      memberId: "",
      observations: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.memberId).toEqual([
        "Selecione um membro.",
      ]);
    }
  });

  it("aceita observação vazia e limita observações preenchidas", () => {
    expect(
      updatePresenceObservationsSchema.safeParse({
        observations: "",
      }).success,
    ).toBe(true);
    expect(
      updatePresenceObservationsSchema.safeParse({
        observations: "a".repeat(2001),
      }).success,
    ).toBe(false);
  });

  it("exige motivo de remoção em português", () => {
    const result = removePresenceSchema.safeParse({ reason: "   " });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.reason).toEqual([
        "Informe o motivo da remoção.",
      ]);
    }
  });
});
