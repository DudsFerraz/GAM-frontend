import { describe, expect, it } from 'vitest'

import { getGenericEventManagementActions } from './eventManagement'

describe('getGenericEventManagementActions', () => {
  it.each([
    ['SCHEDULED', ['edit', 'cancel', 'remove']],
    ['COMPLETED', ['edit', 'lock', 'finalize', 'remove']],
    ['LOCKED', ['edit', 'finalize', 'reopen']],
    ['FINALIZED', ['reopen']],
    ['CANCELLED', ['remove']],
  ])('expõe somente as ações aceitas para %s', (status, expected) => {
    expect(getGenericEventManagementActions(status)).toEqual(expected)
  })

  it('não oferece ações para uma situação desconhecida', () => {
    expect(getGenericEventManagementActions('FUTURE_STATUS')).toEqual([])
    expect(getGenericEventManagementActions(null)).toEqual([])
  })
})
