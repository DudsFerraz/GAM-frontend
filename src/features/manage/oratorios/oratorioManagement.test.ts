import { describe, expect, it } from 'vitest'

import {
  canEditOratorioPlanning,
  getOratorioLifecycleActions,
} from './oratorioManagement'

describe('gestão da ocorrência de Oratório', () => {
  it('expõe somente as transições aceitas para cada situação', () => {
    expect(getOratorioLifecycleActions('SCHEDULED')).toEqual([
      'cancel',
      'remove',
    ])
    expect(getOratorioLifecycleActions('COMPLETED')).toEqual([
      'lock',
      'finalize',
      'remove',
    ])
    expect(getOratorioLifecycleActions('LOCKED')).toEqual([
      'finalize',
      'reopen-completed',
    ])
    expect(getOratorioLifecycleActions('FINALIZED')).toEqual([
      'reopen-locked',
      'reopen-completed',
    ])
    expect(getOratorioLifecycleActions('CANCELLED')).toEqual(['remove'])
    expect(getOratorioLifecycleActions('FUTURE_STATUS')).toEqual([])
  })

  it('fecha o planejamento finalizado ou cancelado', () => {
    expect(canEditOratorioPlanning('SCHEDULED')).toBe(true)
    expect(canEditOratorioPlanning('COMPLETED')).toBe(true)
    expect(canEditOratorioPlanning('LOCKED')).toBe(true)
    expect(canEditOratorioPlanning('FINALIZED')).toBe(false)
    expect(canEditOratorioPlanning('CANCELLED')).toBe(false)
  })
})
