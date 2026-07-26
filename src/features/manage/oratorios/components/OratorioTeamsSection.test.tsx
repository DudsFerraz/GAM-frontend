import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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
})
