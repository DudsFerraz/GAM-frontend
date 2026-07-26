import { describe, expect, it } from 'vitest'

import {
  areHumanEquivalentNames,
  canonicalizeNameSeparators,
} from './name'

describe('equivalência humana de nomes', () => {
  it('ignora caixa, acentos e espaços entre nome e sobrenome', () => {
    expect(areHumanEquivalentNames(
      { firstName: 'João', surname: 'da Silva' },
      { firstName: 'JOAO', surname: '  da Silva' },
    )).toBe(true)
  })

  it('mantém pontuação semanticamente relevante', () => {
    expect(areHumanEquivalentNames(
      { firstName: 'Ana-Maria', surname: 'Souza' },
      { firstName: 'Ana Maria', surname: 'Souza' },
    )).toBe(false)
  })

  it('canonicaliza apóstrofos e hífens tipográficos', () => {
    expect(canonicalizeNameSeparators('D’Ávila–Souza'))
      .toBe("D'Ávila-Souza")
  })
})
