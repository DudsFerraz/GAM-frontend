import { describe, expect, it } from 'vitest'

import {
  getEffectiveOratorioStatus,
  getOratorioAttendanceAvailability,
} from './attendanceRules'

describe('disponibilidade de presença do Oratório', () => {
  it('permite a ocorrência agendada antes do início e da antiga janela', () => {
    const event = {
      beginDate: '2026-08-02T14:00:00-03:00',
      status: 'SCHEDULED' as const,
    }

    expect(
      getOratorioAttendanceAvailability(
        event,
        new Date('2026-08-02T13:00:00-03:00'),
      ),
    ).toEqual({
      canMark: true,
      canUncheck: true,
      message: null,
      removalReasonRequired: false,
    })
  })

  it('não exige datas para liberar uma ocorrência agendada', () => {
    expect(
      getOratorioAttendanceAvailability({ status: 'SCHEDULED' }),
    ).toEqual({
      canMark: true,
      canUncheck: true,
      message: null,
      removalReasonRequired: false,
    })
  })

  it('exige motivo para correção de ocorrência concluída', () => {
    expect(
      getOratorioAttendanceAvailability({ status: 'COMPLETED' }),
    ).toMatchObject({
      canMark: true,
      canUncheck: true,
      removalReasonRequired: true,
    })
  })

  it('atualiza uma tela aberta quando chega o fim da ocorrência', () => {
    const event = {
      beginDate: '2026-08-02T14:00:00-03:00',
      endDate: '2026-08-02T17:00:00-03:00',
      status: 'SCHEDULED' as const,
    }
    const evaluationInstant = new Date('2026-08-02T17:00:00-03:00')

    expect(getEffectiveOratorioStatus(event, evaluationInstant))
      .toBe('COMPLETED')
    expect(
      getOratorioAttendanceAvailability(event, evaluationInstant),
    ).toMatchObject({
      canMark: true,
      canUncheck: true,
      removalReasonRequired: true,
    })
  })

  it('preserva o status concluído mesmo se o relógio local estiver atrasado', () => {
    const event = {
      beginDate: '2026-08-02T14:00:00-03:00',
      endDate: '2026-08-02T17:00:00-03:00',
      status: 'COMPLETED' as const,
    }

    expect(
      getEffectiveOratorioStatus(
        event,
        new Date('2026-08-02T16:59:00-03:00'),
      ),
    ).toBe('COMPLETED')
    expect(
      getOratorioAttendanceAvailability(
        event,
        new Date('2026-08-02T16:59:00-03:00'),
      ),
    ).toMatchObject({ removalReasonRequired: true })
  })

  it('permite somente remover uma marcação cancelada', () => {
    expect(
      getOratorioAttendanceAvailability({ status: 'CANCELLED' }),
    ).toMatchObject({
      canMark: false,
      canUncheck: true,
      removalReasonRequired: false,
    })
  })

  it.each(['LOCKED', 'FINALIZED'] as const)(
    'fecha todas as alterações em %s',
    (status) => {
      expect(
        getOratorioAttendanceAvailability({ status }),
      ).toMatchObject({ canMark: false, canUncheck: false })
    },
  )
})
