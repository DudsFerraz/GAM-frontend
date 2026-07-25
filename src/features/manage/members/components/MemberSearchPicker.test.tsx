import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MemberSearchPicker } from './MemberSearchPicker'

const hookMocks = vi.hoisted(() => ({
  useSearchMembers: vi.fn(),
}))

vi.mock('../hooks/useSearchMembers', () => hookMocks)

describe('MemberSearchPicker', () => {
  it('seleciona um membro por dados de negócio sem exibir o identificador', async () => {
    const onSelect = vi.fn()
    hookMocks.useSearchMembers.mockReturnValue({
      data: {
        items: [{
          birthDate: null,
          displayName: 'Ana Silva',
          email: 'ana@example.test',
          firstName: 'Ana',
          id: '550e8400-e29b-41d4-a716-446655440000',
          phoneNumber: null,
          status: 'ACTIVE',
          surname: 'Silva',
        }],
      },
      isError: false,
      isLoading: false,
    })

    render(<MemberSearchPicker includeInactive onSelect={onSelect} />)

    fireEvent.change(screen.getByLabelText('Buscar membro'), {
      target: { value: 'Ana' },
    })

    expect(await screen.findByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText('ana@example.test')).toBeInTheDocument()
    expect(screen.queryByText('550e8400-e29b-41d4-a716-446655440000'))
      .not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Ana Silva/ }))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'Ana',
    }))
    expect(hookMocks.useSearchMembers).toHaveBeenLastCalledWith(
      expect.objectContaining({ showInactive: true }),
    )
  })
})
