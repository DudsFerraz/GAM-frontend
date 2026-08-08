import { describe, expect, it } from 'vitest'

import type { FieldConfig } from '@/components/SearchAndFilter'

import { MEMBERS_FILTER_CONFIG } from './memberSearchConfig'

function getField(key: string): FieldConfig {
  const field = MEMBERS_FILTER_CONFIG.find((item) => item.key === key)
  if (!field) {
    throw new Error(`Configuração ausente para ${key}`)
  }
  return field
}

describe('configuração da busca de membros', () => {
  it('orienta a busca parcial de telefone antes da API', () => {
    const validateValue = getField('phoneNumber').validateValue

    expect(validateValue?.('19', 'LIKE'))
      .toBe('Digite pelo menos 4 dígitos para pesquisar por telefone.')
    expect(validateValue?.('', 'LIKE'))
      .toBe('Digite pelo menos 4 dígitos para pesquisar por telefone.')
    expect(validateValue?.('(19) 99', 'LIKE')).toBeUndefined()
    expect(validateValue?.('1999 ramal', 'LIKE'))
      .toBe('Use somente números e sinais comuns de telefone, como +, espaços, parênteses ou hífen.')
  })

  it('exige telefone internacional completo para igualdade', () => {
    const validateValue = getField('phoneNumber').validateValue

    expect(validateValue?.('+5519999999999', 'EQUALS')).toBeUndefined()
    expect(validateValue?.('19999999999', 'EQUALS'))
      .toBe('Informe o telefone completo no formato internacional, como +5519999999999.')
  })

  it('aplica a validação compartilhada ao e-mail', () => {
    const validateValue = getField('email').validateValue

    expect(validateValue?.('ab', 'LIKE'))
      .toBe('Digite pelo menos 3 caracteres para pesquisar por e-mail.')
    expect(validateValue?.('pessoa@example.com', 'EQUALS')).toBeUndefined()
  })
})
