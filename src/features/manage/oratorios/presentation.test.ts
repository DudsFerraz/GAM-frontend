import { describe, expect, it } from 'vitest'

import {
  formatOratorioDate,
  formatOratorioLocalDate,
  getAttendancePersonName,
  getAttendancePersonRestrictionLabel,
  getOratorioSchedulePresentation,
  getOratorioTeamLabel,
} from './presentation'

describe('apresentação do Oratório', () => {
  it('fixa o fuso de São Paulo para o instante da ocorrência', () => {
    expect(formatOratorioDate('2026-08-02T17:00:00Z'))
      .toBe('02 de agosto de 2026')
  })

  it('não desloca uma data local para o dia anterior', () => {
    expect(formatOratorioLocalDate('2026-08-02')).toBe('02/08/2026')
  })

  it('reconhece a estrutura fixa sem renderizar metadados crus', () => {
    expect(getOratorioSchedulePresentation([
      {
        activity: 'Recreação livre',
        closingBoundary: false,
        endTime: '15:30',
        startTime: '14:00',
      },
      {
        activity: 'Gincana',
        closingBoundary: false,
        endTime: '16:30',
        startTime: '15:30',
      },
      {
        activity: 'Boa Tarde das Crianças and Boa Tarde dos Jovens',
        closingBoundary: false,
        endTime: '17:00',
        startTime: '16:30',
      },
      {
        activity: 'Lanche',
        closingBoundary: true,
        startTime: '17:00',
      },
    ])?.at(-1)?.activity).toBe('Lanche e encerramento')
  })

  it('recusa uma estrutura de programação futura ou inesperada', () => {
    expect(getOratorioSchedulePresentation([{
      activity: 'Atividade futura',
      closingBoundary: false,
      endTime: '15:30',
      startTime: '14:00',
    }])).toBeNull()
  })

  it('usa fallbacks neutros para valores de contrato desconhecidos', () => {
    expect(getOratorioTeamLabel('FUTURE_TEAM'))
      .toBe('Equipe não identificada')
    expect(getAttendancePersonName()).toBe('Nome não informado')
    expect(getAttendancePersonRestrictionLabel({
      deleted: true,
      status: 'REGISTERED',
    })).toBe('Cadastro removido')
    expect(getAttendancePersonRestrictionLabel({
      deleted: false,
      status: 'INACTIVE',
    })).toBe('Membro inativo')
    expect(getAttendancePersonRestrictionLabel({
      deleted: false,
      status: 'FUTURE_STATUS',
    })).toBeNull()
  })
})
