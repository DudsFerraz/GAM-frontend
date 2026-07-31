import { describe, expect, it } from 'vitest'

import {
  getConfirmationLabel,
  getHealthAnswerLabel,
  getOratorianoFormOriginLabel,
  getOratorianoFormStatusPresentation,
  getResponsibleRelationshipLabel,
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
    expect(getResponsibleRelationshipLabel('FUTURE'))
      .toBe('Relação não identificada')
    expect(getHealthAnswerLabel('FUTURE'))
      .toBe('Resposta não identificada')
  })

  it('traduz relacionamentos e respostas conhecidos', () => {
    expect(getResponsibleRelationshipLabel('SELF'))
      .toBe('Próprio Oratoriano')
    expect(getResponsibleRelationshipLabel('REFERENCE_ADULT'))
      .toBe('Adulto de referência')
    expect(getHealthAnswerLabel('YES')).toBe('Sim')
    expect(getHealthAnswerLabel('NOT_INFORMED')).toBe('Não informado')
  })

  it('apresenta confirmações e ausências deliberadamente', () => {
    expect(getConfirmationLabel(true)).toBe('Confirmado')
    expect(getConfirmationLabel(false)).toBe('Não confirmado')
    expect(getConfirmationLabel(undefined)).toBe('Não informado')
  })
})
