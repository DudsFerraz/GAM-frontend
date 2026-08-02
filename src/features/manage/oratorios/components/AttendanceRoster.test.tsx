import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { AttendanceRoster } from './AttendanceRoster'

const openAvailability = {
  canMark: true,
  canUncheck: true,
  message: null,
  removalReasonRequired: false,
}

const roster = {
  items: [
    {
      person: {
        firstName: 'Ana',
        id: 'ana-id',
        surname: 'Souza',
      },
    },
    {
      attendance: {
        id: 'attendance-id',
        person: {
          firstName: 'Bruno',
          id: 'bruno-id',
          surname: 'Silva',
        },
      },
      person: {
        firstName: 'Bruno',
        id: 'bruno-id',
        surname: 'Silva',
      },
    },
  ],
  page: 0,
  totalElements: 2,
  totalPages: 1,
}

function renderRoster(overrides: Partial<
  ComponentProps<typeof AttendanceRoster>
> = {}) {
  const props: ComponentProps<typeof AttendanceRoster> = {
    availability: openAvailability,
    canManage: true,
    error: null,
    isError: false,
    isFetching: false,
    isLoading: false,
    kind: 'oratorianos',
    nameInput: '',
    onNameInputChange: vi.fn(),
    onPageChange: vi.fn(),
    onRetry: vi.fn(),
    onToggle: vi.fn(),
    page: 0,
    pendingKeys: new Set(),
    roster,
    ...overrides,
  }

  render(<AttendanceRoster {...props} />)
  return props
}

describe('AttendanceRoster', () => {
  it('mantém somente a busca automática, sem botão de submissão', async () => {
    const props = renderRoster()

    const input = screen.getByRole('searchbox', {
      name: 'Buscar Oratorianos pelo nome',
    })
    fireEvent.change(input, { target: { value: 'Ana' } })

    expect(props.onNameInputChange).toHaveBeenLastCalledWith('Ana')
    expect(screen.queryByRole('button', { name: 'Buscar' })).not.toBeInTheDocument()
  })

  it('limpa o termo sem submeter um formulário', async () => {
    const props = renderRoster({ nameInput: 'Ana' })

    await userEvent.setup().click(
      screen.getByRole('button', { name: 'Limpar busca' }),
    )

    expect(props.onNameInputChange).toHaveBeenCalledWith('')
  })

  it('persiste a intenção de cada checkbox individualmente', async () => {
    const user = userEvent.setup()
    const props = renderRoster()

    await user.click(screen.getByRole('checkbox', {
      name: 'Marcar presença de Ana Souza',
    }))
    await user.click(screen.getByRole('checkbox', {
      name: 'Remover presença de Bruno Silva',
    }))

    expect(props.onToggle).toHaveBeenNthCalledWith(
      1,
      'oratorianos',
      roster.items[0],
      true,
    )
    expect(props.onToggle).toHaveBeenNthCalledWith(
      2,
      'oratorianos',
      roster.items[1],
      false,
    )
  })

  it('em ocorrência cancelada bloqueia novas marcações e permite remover as existentes', () => {
    renderRoster({
      availability: {
        canMark: false,
        canUncheck: true,
        message: 'Ocorrência cancelada.',
        removalReasonRequired: false,
      },
    })

    expect(screen.getByRole('checkbox', {
      name: 'Marcar presença de Ana Souza',
    })).toBeDisabled()
    expect(screen.getByRole('checkbox', {
      name: 'Remover presença de Bruno Silva',
    })).toBeEnabled()
  })

  it('mantém o roster visível e sem edição quando a conta só pode consultar', () => {
    renderRoster({ canManage: false })

    expect(screen.getByText('Ana Souza')).toBeInTheDocument()
    expect(
      screen.getAllByRole('checkbox')
        .every((checkbox) => checkbox.hasAttribute('disabled')),
    ).toBe(true)
  })

  it('não mantém dados cacheados visíveis quando a consulta falha', () => {
    renderRoster({
      error: new Error('Falha de consulta'),
      isError: true,
    })

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText('Ana Souza')).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
