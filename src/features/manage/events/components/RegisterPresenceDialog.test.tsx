import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RegisterPresenceDialog } from './RegisterPresenceDialog'

const mutationMocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  reset: vi.fn(),
}))

vi.mock('../hooks/useEvents', () => ({
  useRegisterEventPresence: () => ({
    error: null,
    isError: false,
    isPending: false,
    mutate: mutationMocks.mutate,
    reset: mutationMocks.reset,
  }),
}))

vi.mock('@/features/manage/members', () => ({
  MemberSearchPicker: ({
    onSelectionClear,
    onSelect,
    selectedMemberId,
  }: {
    onSelectionClear: () => void
    onSelect: (member: {
      displayName: string
      firstName: string
      id: string
      surname: string
    }) => void
    selectedMemberId?: string
  }) => (
    <div>
      <p>Selecionado: {selectedMemberId ?? 'nenhum'}</p>
      <button
        onClick={() => onSelect({
          displayName: 'Ana Silva',
          firstName: 'Ana',
          id: '550e8400-e29b-41d4-a716-446655440000',
          surname: 'Silva',
        })}
        type="button"
      >
        Selecionar Ana
      </button>
      <button onClick={onSelectionClear} type="button">
        Alterar busca
      </button>
    </div>
  ),
}))

beforeEach(() => {
  mutationMocks.mutate.mockReset()
  mutationMocks.reset.mockReset()
})

describe('RegisterPresenceDialog', () => {
  it('limpa membro, formulário e mutação ao fechar', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(
      <RegisterPresenceDialog
        canSearchMembers
        canViewInactiveMembers={false}
        eventId="event-id"
        onOpenChange={onOpenChange}
        onRegistered={vi.fn()}
        open
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Selecionar Ana' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Observações' }),
      'Chegou no horário.',
    )
    expect(screen.getByText(/Selecionado: 550e8400/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(mutationMocks.reset).toHaveBeenCalledOnce()
    expect(screen.getByText('Selecionado: nenhum')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Observações' })).toHaveValue('')
  })

  it('impede o envio do membro anterior depois que a busca muda', async () => {
    const user = userEvent.setup()
    render(
      <RegisterPresenceDialog
        canSearchMembers
        canViewInactiveMembers={false}
        eventId="event-id"
        onOpenChange={vi.fn()}
        onRegistered={vi.fn()}
        open
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Selecionar Ana' }))
    await user.click(screen.getByRole('button', { name: 'Alterar busca' }))
    await user.click(
      screen.getByRole('button', { name: 'Registrar presença' }),
    )

    expect(await screen.findByText('Selecione um membro.')).toBeInTheDocument()
    expect(mutationMocks.mutate).not.toHaveBeenCalled()
  })
})
