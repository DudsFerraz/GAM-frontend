import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MemberSearchPicker } from './MemberSearchPicker'

const hookMocks = vi.hoisted(() => ({
  useSearchMembers: vi.fn(),
}))

vi.mock('../hooks/useSearchMembers', () => hookMocks)

const member = {
  birthDate: null,
  displayName: 'Ana Silva',
  email: 'ana@example.test',
  firstName: 'Ana',
  id: '550e8400-e29b-41d4-a716-446655440000',
  phoneNumber: null,
  status: 'ACTIVE' as const,
  surname: 'Silva',
}

beforeEach(() => {
  hookMocks.useSearchMembers.mockReset()
  hookMocks.useSearchMembers.mockReturnValue({
    data: { items: [member] },
    isError: false,
    isFetching: false,
    isLoading: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('MemberSearchPicker', () => {
  it('marca a seleção como obrigatória sem exigir o texto de busca', () => {
    render(
      <MemberSearchPicker
        onSelectionClear={vi.fn()}
        onSelect={vi.fn()}
        required
      />,
    )

    expect(screen.getByRole('group', { name: 'Buscar membro' }))
      .toHaveAttribute('aria-required', 'true')
    expect(screen.getByText('Buscar membro')).toHaveAttribute(
      'data-required',
      'true',
    )
    expect(screen.getByRole('searchbox', { name: 'Buscar membro' })).not.toHaveAttribute(
      'required',
    )
  })

  it('seleciona um membro por dados de negócio sem exibir o identificador', async () => {
    const onSelect = vi.fn()

    render(
      <MemberSearchPicker
        includeInactive
        onSelectionClear={vi.fn()}
        onSelect={onSelect}
      />,
    )

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar membro' }), {
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
      expect.objectContaining({
        pageParams: { page: 0, size: 8 },
        showInactive: true,
      }),
    )
  })

  it('limpa a seleção anterior quando o termo de busca muda', async () => {
    const onSelectionClear = vi.fn()
    const { rerender } = render(
      <MemberSearchPicker
        onSelectionClear={onSelectionClear}
        onSelect={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar membro' }), {
      target: { value: 'Ana' },
    })
    expect(await screen.findByText('Ana Silva')).toBeInTheDocument()

    rerender(
      <MemberSearchPicker
        onSelectionClear={onSelectionClear}
        onSelect={vi.fn()}
        selectedMemberId={member.id}
      />,
    )
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar membro' }), {
      target: { value: 'Bia' },
    })

    expect(onSelectionClear).toHaveBeenCalledOnce()
  })

  it('não oferece resultados anteriores enquanto a nova busca está pendente', async () => {
    hookMocks.useSearchMembers.mockReturnValue({
      data: { items: [member] },
      isError: false,
      isFetching: true,
      isLoading: false,
      isPlaceholderData: true,
      refetch: vi.fn(),
    })

    render(
      <MemberSearchPicker
        onSelectionClear={vi.fn()}
        onSelect={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar membro' }), {
      target: { value: 'Ana' },
    })

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Buscando membros…',
    )
    expect(screen.queryByText('Ana Silva')).not.toBeInTheDocument()
  })

  it('anuncia a atualização da consulta atual sem ocultar resultados coerentes', async () => {
    vi.useFakeTimers()
    hookMocks.useSearchMembers.mockReturnValue({
      data: { items: [member] },
      isError: false,
      isFetching: true,
      isLoading: false,
      isPlaceholderData: false,
      refetch: vi.fn(),
    })

    render(
      <MemberSearchPicker
        onSelectionClear={vi.fn()}
        onSelect={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar membro' }), {
      target: { value: 'Ana' },
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(screen.getByRole('status')).toHaveTextContent(
      'Atualizando resultados…',
    )
    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
  })

  it('permite tentar novamente após uma falha', async () => {
    const refetch = vi.fn()
    const user = userEvent.setup()
    hookMocks.useSearchMembers.mockReturnValue({
      data: undefined,
      error: new Error('diagnóstico interno'),
      isError: true,
      isFetching: false,
      isLoading: false,
      isPlaceholderData: false,
      refetch,
    })

    render(
      <MemberSearchPicker
        onSelectionClear={vi.fn()}
        onSelect={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar membro' }), {
      target: { value: 'Ana' },
    })

    await user.click(
      await screen.findByRole('button', { name: 'Tentar novamente' }),
    )
    expect(refetch).toHaveBeenCalledOnce()
    expect(screen.queryByText('diagnóstico interno')).not.toBeInTheDocument()
  })
})
