import { describe, expect, it } from 'vitest'

import { getSolicitationStatusLabel } from './presentation'

describe('apresentação de solicitações', () => {
  it.each([
    ['PENDING', 'Pendente'],
    ['APPROVED', 'Aprovada'],
    ['REJECTED', 'Rejeitada'],
  ])('traduz %s', (status, label) => {
    expect(getSolicitationStatusLabel(status)).toBe(label)
  })

  it('não expõe valores desconhecidos', () => {
    expect(getSolicitationStatusLabel('INTERNAL_REVIEW')).toBe(
      'Situação não identificada',
    )
  })
})
