import { describe, expect, it } from 'vitest'

import { formatCountryName, formatDate, formatDateTime } from './format'

describe('formatDate', () => {
  it('formata datas civis sem deslocar o dia', () => {
    expect(formatDate('2024-02-29')).toBe('29/02/2024')
  })

  it.each([
    [undefined, 'Não informado'],
    [null, 'Não informado'],
    ['', 'Não informado'],
    ['não-é-data', 'Data inválida'],
  ])('usa feedback seguro para %s', (value, expected) => {
    expect(formatDate(value)).toBe(expected)
  })
})

describe('formatDateTime', () => {
  it('formata data e hora em português brasileiro', () => {
    expect(formatDateTime('2026-07-19T15:30:00')).toMatch(
      /19\/07\/2026.*15:30/,
    )
  })

  it('não devolve o valor de transporte quando ele é inválido', () => {
    expect(formatDateTime('valor-interno')).toBe('Data e hora inválidas')
  })
})

describe('formatCountryName', () => {
  it('normaliza o código e apresenta o nome localizado', () => {
    expect(formatCountryName(' br ')).toBe('Brasil')
  })

  it.each([undefined, null, ''])('informa a ausência do país para %s', (value) => {
    expect(formatCountryName(value)).toBe('País não informado')
  })

  it('não expõe um código inválido', () => {
    expect(formatCountryName('código-inválido')).toBe('País não identificado')
  })
})
