import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { OratorioTeamsSection } from './OratorioTeamsSection'

const hookMocks = vi.hoisted(() => ({
  useAssignOratorioTeamMember: vi.fn(),
  useAttendanceRoster: vi.fn(),
  useRemoveOratorioTeamMember: vi.fn(),
}))

vi.mock('../hooks/useOratorios', () => hookMocks)

beforeEach(() => {
  for (const mock of Object.values(hookMocks)) {
    mock.mockReset()
  }
  hookMocks.useAttendanceRoster.mockReturnValue({
    data: { items: [], page: 0, totalElements: 0, totalPages: 0 },
    error: null,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  })
  hookMocks.useAssignOratorioTeamMember.mockReturnValue({
    error: null,
    isError: false,
    isPending: false,
    mutate: vi.fn(),
  })
  hookMocks.useRemoveOratorioTeamMember.mockReturnValue({
    error: null,
    isError: false,
    isPending: false,
    mutate: vi.fn(),
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('OratorioTeamsSection', () => {
  it('fecha o seletor e interrompe a consulta quando a capacidade muda', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <OratorioTeamsSection
        canManage
        canReadRoster
        oratorioId="oratorio-id"
        teams={[]}
      />,
    )

    await user.click(screen.getByRole('button', {
      name: 'Adicionar membro à Equipe do Lanche',
    }))

    expect(screen.getByRole('dialog', {
      name: 'Adicionar à Equipe do Lanche',
    })).toBeInTheDocument()
    expect(hookMocks.useAttendanceRoster).toHaveBeenLastCalledWith(
      'oratorio-id',
      'members',
      0,
      '',
      true,
    )
    expect(screen.queryByRole('button', { name: 'Buscar' })).not.toBeInTheDocument()
    const rosterCallCount =
      hookMocks.useAttendanceRoster.mock.calls.length

    rerender(
      <OratorioTeamsSection
        canManage={false}
        canReadRoster={false}
        oratorioId="oratorio-id"
        teams={[]}
      />,
    )

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(hookMocks.useAttendanceRoster).toHaveBeenCalledTimes(
      rosterCallCount,
    )
  })

  it('aguarda o debounce antes de consultar um novo termo', () => {
    vi.useFakeTimers()
    render(
      <OratorioTeamsSection
        canManage
        canReadRoster
        oratorioId="oratorio-id"
        teams={[]}
      />,
    )

    fireEvent.click(screen.getByRole('button', {
      name: 'Adicionar membro à Equipe do Lanche',
    }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Nome do membro' }), {
      target: { value: 'Ana' },
    })

    expect(hookMocks.useAttendanceRoster).toHaveBeenLastCalledWith(
      'oratorio-id',
      'members',
      0,
      '',
      false,
    )

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(hookMocks.useAttendanceRoster).toHaveBeenLastCalledWith(
      'oratorio-id',
      'members',
      0,
      'Ana',
      true,
    )
  })
})
