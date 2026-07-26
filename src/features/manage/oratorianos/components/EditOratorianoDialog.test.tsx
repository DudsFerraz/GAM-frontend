import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EditOratorianoDialog } from './EditOratorianoDialog'

const hookMocks = vi.hoisted(() => ({
  useReplaceOratoriano: vi.fn(),
}))

vi.mock('../hooks/useOratorianos', () => hookMocks)

beforeEach(() => {
  hookMocks.useReplaceOratoriano.mockReset()
  hookMocks.useReplaceOratoriano.mockReturnValue({
    error: null,
    isError: false,
    isPending: false,
    mutate: vi.fn(),
    reset: vi.fn(),
  })
})

describe('EditOratorianoDialog', () => {
  it('reabre com os valores mais recentes do perfil', () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <EditOratorianoDialog
        onOpenChange={onOpenChange}
        open
        oratoriano={{
          birthDate: '2014-03-12',
          firstName: 'Ana',
          surname: 'Souza',
        }}
        oratorianoId="oratoriano-id"
      />,
    )

    expect(screen.getByLabelText('Nome')).toHaveValue('Ana')

    rerender(
      <EditOratorianoDialog
        onOpenChange={onOpenChange}
        open={false}
        oratoriano={{
          birthDate: '2014-03-12',
          firstName: 'Beatriz',
          phoneNumber: '19999999999',
          surname: 'Souza',
        }}
        oratorianoId="oratoriano-id"
      />,
    )
    rerender(
      <EditOratorianoDialog
        onOpenChange={onOpenChange}
        open
        oratoriano={{
          birthDate: '2014-03-12',
          firstName: 'Beatriz',
          phoneNumber: '19999999999',
          surname: 'Souza',
        }}
        oratorianoId="oratoriano-id"
      />,
    )

    expect(screen.getByLabelText('Nome')).toHaveValue('Beatriz')
    expect(screen.getByLabelText('Telefone')).toHaveValue('19999999999')
  })
})
