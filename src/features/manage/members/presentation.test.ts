import { describe, expect, it } from 'vitest'

import {
  getMemberStatusBadgeClassName,
  getMemberStatusLabel,
} from './presentation'

describe('apresentação de membros', () => {
  it('traduz as situações conhecidas', () => {
    expect(getMemberStatusLabel('ACTIVE')).toBe('Ativo')
    expect(getMemberStatusLabel('INACTIVE')).toBe('Inativo')
  })

  it('não expõe uma situação futura', () => {
    expect(getMemberStatusLabel('PENDING_INTERNAL')).toBe('Situação não informada')
  })

  it('usa estilo neutro para uma situação desconhecida', () => {
    expect(getMemberStatusBadgeClassName('PENDING_INTERNAL')).toContain('slate')
    expect(getMemberStatusBadgeClassName('PENDING_INTERNAL')).not.toContain('emerald')
    expect(getMemberStatusBadgeClassName('PENDING_INTERNAL')).not.toContain('red-')
  })
})
