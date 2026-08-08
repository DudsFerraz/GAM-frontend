import { describe, expect, it } from 'vitest'

import type { FieldConfig } from '@/components/SearchAndFilter'

import { ACCOUNT_SEARCH_CONFIG } from './accountSearchConfig'

function getField(key: string): FieldConfig {
  const field = ACCOUNT_SEARCH_CONFIG.find((item) => item.key === key)
  if (!field) {
    throw new Error(`Configuração ausente para ${key}`)
  }
  return field
}

describe('configuração da busca de contas', () => {
  it('limita o nome de exibição ao tamanho aceito pelo contrato', () => {
    const validateValue = getField('displayName').validateValue

    expect(validateValue?.('a'.repeat(50), 'LIKE')).toBeUndefined()
    expect(validateValue?.('a'.repeat(51), 'LIKE'))
      .toBe('Digite no máximo 50 caracteres para pesquisar por nome de exibição.')
  })

  it('aplica as regras compartilhadas de e-mail', () => {
    const validateValue = getField('email').validateValue

    expect(validateValue?.('contato.com', 'LIKE'))
      .toBe('Inclua @ ao pesquisar um trecho de e-mail que contenha ponto.')
    expect(validateValue?.('contato@example.com', 'EQUALS')).toBeUndefined()
  })
})
