import { describe, expect, it } from 'vitest'

import { resolvePresentationLabel } from './presentation'

describe('resolvePresentationLabel', () => {
  const labels = { ACTIVE: 'Ativo', INACTIVE: 'Inativo' }

  it('resolve um valor conhecido', () => {
    expect(resolvePresentationLabel(labels, 'ACTIVE', 'Situação desconhecida')).toBe('Ativo')
  })

  it.each([undefined, null, '', 'ARCHIVED'])(
    'usa o fallback sem expor um valor ausente ou desconhecido (%s)',
    (value) => {
      expect(resolvePresentationLabel(labels, value, 'Situação desconhecida')).toBe(
        'Situação desconhecida',
      )
    },
  )

  it('não resolve propriedades herdadas como rótulos da aplicação', () => {
    expect(resolvePresentationLabel(labels, 'toString', 'Situação desconhecida')).toBe(
      'Situação desconhecida',
    )
  })
})
