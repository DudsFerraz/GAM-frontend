import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OratorioSchedule } from './OratorioSchedule'

const hookMocks = vi.hoisted(() => ({
  useAssignOratorioTeamMember: vi.fn(),
  useAttendanceRoster: vi.fn(),
  useRemoveOratorioTeamMember: vi.fn(),
  useReplaceOratorioPlanning: vi.fn(),
}))

vi.mock('../hooks/useOratorios', () => hookMocks)

const schedule = [
  {
    activity: 'Recreação livre',
    closingBoundary: false,
    endTime: '15:30',
    startTime: '14:00',
  },
  {
    activity: 'Gincana',
    closingBoundary: false,
    endTime: '16:30',
    startTime: '15:30',
  },
  {
    activity: 'Boa Tarde das Crianças and Boa Tarde dos Jovens',
    closingBoundary: false,
    endTime: '17:00',
    startTime: '16:30',
  },
  {
    activity: 'Lanche',
    closingBoundary: true,
    endTime: undefined,
    startTime: '17:00',
  },
]

const planning = {
  boaTardeCriancasPlan: 'Tema das crianças',
  boaTardeJovensPlan: 'Tema dos jovens',
  gincanaDescription: 'Materiais da gincana',
  lancheDescription: 'Lanche previsto',
}

function renderSchedule(canEdit = false) {
  return render(
    <OratorioSchedule
      canEditPlanning={canEdit}
      canManageTeams={false}
      canReadRoster={false}
      oratorioId="oratorio-id"
      planning={planning}
      schedule={schedule}
      teams={[]}
    />,
  )
}

beforeEach(() => {
  hookMocks.useAssignOratorioTeamMember.mockReset()
  hookMocks.useAttendanceRoster.mockReset()
  hookMocks.useRemoveOratorioTeamMember.mockReset()
  hookMocks.useReplaceOratorioPlanning.mockReset()

  hookMocks.useAssignOratorioTeamMember.mockReturnValue({
    isError: false,
    isPending: false,
    mutate: vi.fn(),
  })
  hookMocks.useAttendanceRoster.mockReturnValue({
    data: { items: [], page: 0, totalElements: 0, totalPages: 0 },
    error: null,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  })
  hookMocks.useRemoveOratorioTeamMember.mockReturnValue({
    isError: false,
    isPending: false,
    mutate: vi.fn(),
  })
  hookMocks.useReplaceOratorioPlanning.mockReturnValue({
    isError: false,
    isPending: false,
    isSuccess: false,
    mutate: vi.fn(),
  })
})

describe('OratorioSchedule', () => {
  it('começa com todos os painéis fechados', () => {
    renderSchedule()

    const buttons = screen.getAllByRole('button')

    expect(buttons).toHaveLength(4)
    expect(buttons.every((button) => button.getAttribute('aria-expanded') === 'false'))
      .toBe(true)
    expect(screen.queryByLabelText('Gincana')).not.toBeInTheDocument()
  })

  it('associa cada frente ao seu planejamento e mantém as frentes paralelas separadas', async () => {
    const user = userEvent.setup()
    renderSchedule()

    const gincanaButton = screen.getByRole('button', { name: /15:30–16:30/ })
    gincanaButton.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('region', { name: /Gincana/ })).toBeInTheDocument()
    expect(screen.getByLabelText('Gincana')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Equipe da Gincana' }))
      .toBeInTheDocument()
    expect(screen.queryByText('Atividades realizadas em paralelo.'))
      .not.toBeInTheDocument()

    await user.keyboard('{Enter}')
    expect(screen.queryByLabelText('Gincana')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /16:30–17:00/ }))

    expect(screen.getByLabelText('Boa Tarde das Crianças')).toBeInTheDocument()
    expect(screen.getByLabelText('Boa Tarde dos Jovens')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Boa Tarde das Crianças' }))
      .toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Boa Tarde dos Jovens' }))
      .toBeInTheDocument()
  })

  it('mantém os quatro valores no envio integral do planejamento', async () => {
    const user = userEvent.setup()
    renderSchedule(true)

    await user.click(screen.getByRole('button', { name: /15:30–16:30/ }))
    fireEvent.change(screen.getByLabelText('Gincana'), {
      target: { value: 'Novo plano da gincana' },
    })
    await user.click(screen.getByRole('button', { name: 'Salvar planejamento' }))

    expect(hookMocks.useReplaceOratorioPlanning.mock.results[0]?.value.mutate)
      .toHaveBeenCalledWith({
        oratorioId: 'oratorio-id',
        payload: {
          boaTardeCriancasPlan: 'Tema das crianças',
          boaTardeJovensPlan: 'Tema dos jovens',
          gincanaDescription: 'Novo plano da gincana',
          lancheDescription: 'Lanche previsto',
        },
      })
  })
})
