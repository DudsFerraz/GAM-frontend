import { describe, expect, it } from 'vitest'

import {
  getOratorianoFormOriginLabel,
  getOratorianoFormStatusPresentation,
} from './presentation'

describe('apresentação de fichas adicionais', () => {
  it.each([
    ['DRAFT', 'Rascunho'],
    ['COMPLETED', 'Concluída'],
    ['SUPERSEDED', 'Substituída'],
    ['REVOKED', 'Revogada'],
  ])('traduz a situação %s', (status, expected) => {
    expect(getOratorianoFormStatusPresentation(status).label)
      .toBe(expected)
  })

  it.each([
    ['PAPER_TRANSCRIPTION', 'Transcrição de papel'],
    ['DIRECT_SYSTEM_ENTRY', 'Preenchimento no sistema'],
  ])('traduz a origem %s', (origin, expected) => {
    expect(getOratorianoFormOriginLabel(origin)).toBe(expected)
  })

  it('não apresenta valores futuros brutos', () => {
    expect(getOratorianoFormStatusPresentation('FUTURE').label)
      .toBe('Situação não identificada')
    expect(getOratorianoFormOriginLabel('FUTURE'))
      .toBe('Origem não identificada')
  })
})
