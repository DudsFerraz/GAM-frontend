import { describe, expect, it } from 'vitest'

import {
  createTrimmedTextMaxLengthValidator,
  validateEmailSearchValue,
} from './searchValidation'

describe('validação compartilhada dos filtros de busca', () => {
  describe('e-mail', () => {
    it.each([
      ['ab', 'Digite pelo menos 3 caracteres para pesquisar por e-mail.'],
      ['contato.com', 'Inclua @ ao pesquisar um trecho de e-mail que contenha ponto.'],
      ['a@b', 'Digite pelo menos 2 caracteres antes de @.'],
    ])('rejeita o trecho %s com orientação específica', (value, message) => {
      expect(validateEmailSearchValue(value, 'LIKE')).toBe(message)
    })

    it.each(['abc', 'ab@', '  ab@exemplo  '])(
      'aceita o trecho %s',
      (value) => {
        expect(validateEmailSearchValue(value, 'LIKE')).toBeUndefined()
      },
    )

    it('exige um e-mail completo para igualdade', () => {
      expect(validateEmailSearchValue('  pessoa@example.com  ', 'EQUALS'))
        .toBeUndefined()
      expect(validateEmailSearchValue('pessoa', 'EQUALS'))
        .toBe('Digite um e-mail completo e válido.')
      expect(validateEmailSearchValue(['pessoa@example.com'], 'EQUALS'))
        .toBe('Digite um e-mail completo e válido.')
    })
  })

  describe('limite máximo de texto', () => {
    const validateValue = createTrimmedTextMaxLengthValidator(
      5,
      'Digite no máximo 5 caracteres.',
    )

    it('aceita o limite exato depois de remover espaços das extremidades', () => {
      expect(validateValue(' 12345 ', 'LIKE')).toBeUndefined()
    })

    it('rejeita texto acima do limite e valores que não sejam texto', () => {
      expect(validateValue('123456', 'LIKE'))
        .toBe('Digite no máximo 5 caracteres.')
      expect(validateValue(['12345'], 'LIKE'))
        .toBe('Digite no máximo 5 caracteres.')
    })
  })
})
