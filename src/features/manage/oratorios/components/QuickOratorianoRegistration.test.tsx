import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { QuickOratorianoRegistration } from './QuickOratorianoRegistration'

const hookMocks = vi.hoisted(() => ({
  useAttendanceRoster: vi.fn(),
  useExactOratorianoAttendanceMatch: vi.fn(),
  useRegisterAndMarkOratoriano: vi.fn(),
}))

vi.mock('../hooks/useOratorios', () => hookMocks)

beforeEach(() => {
  hookMocks.useAttendanceRoster.mockReset()
  hookMocks.useExactOratorianoAttendanceMatch.mockReset()
  hookMocks.useRegisterAndMarkOratoriano.mockReset()
  hookMocks.useAttendanceRoster.mockReturnValue({
    data: {
      items: [{
        person: {
          firstName: 'João',
          id: 'existing-id',
          surname: 'Silva',
        },
      }],
      page: 0,
      totalElements: 1,
      totalPages: 1,
    },
    error: null,
    isError: false,
    isFetching: false,
    isLoading: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
  })
  hookMocks.useExactOratorianoAttendanceMatch.mockReturnValue({
    data: null,
    error: null,
    isError: false,
    isFetching: false,
    isLoading: false,
    isSuccess: true,
    refetch: vi.fn(),
  })
  hookMocks.useRegisterAndMarkOratoriano.mockReturnValue({
    error: null,
    isError: false,
    isPending: false,
    mutate: vi.fn(),
    reset: vi.fn(),
  })
})

describe('QuickOratorianoRegistration', () => {
  it('exige busca e bloqueia criação diante de nome humanamente equivalente', async () => {
    const user = userEvent.setup()
    const onMarkExisting = vi.fn().mockResolvedValue(true)
    render(
      <QuickOratorianoRegistration
        enabled
        onMarkExisting={onMarkExisting}
        oratorioId="oratorio-id"
      />,
    )

    expect(screen.queryByRole('button', {
      name: 'Cadastrar e marcar',
    })).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Nome'), 'JOAO')
    await user.type(screen.getByLabelText('Sobrenome completo'), 'SILVA')
    await user.click(screen.getByRole('button', {
      name: 'Conferir nome',
    }))

    expect(await screen.findByText('Use o cadastro encontrado.'))
      .toBeInTheDocument()
    expect(screen.queryByRole('button', {
      name: 'Cadastrar e marcar',
    })).not.toBeInTheDocument()
    expect(onMarkExisting).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', {
      name: 'Marcar este cadastro',
    }))

    expect(onMarkExisting).toHaveBeenCalledTimes(1)
  })

  it('mantém resultado parecido visível sem marcá-lo automaticamente', async () => {
    const user = userEvent.setup()
    const onMarkExisting = vi.fn().mockResolvedValue(true)
    render(
      <QuickOratorianoRegistration
        enabled
        onMarkExisting={onMarkExisting}
        oratorioId="oratorio-id"
      />,
    )

    await user.type(screen.getByLabelText('Nome'), 'João')
    await user.type(screen.getByLabelText('Sobrenome completo'), 'Sil')
    await user.click(screen.getByRole('button', {
      name: 'Conferir nome',
    }))

    expect(await screen.findByText('João Silva')).toBeInTheDocument()
    expect(screen.getByRole('button', {
      name: 'Cadastrar e marcar',
    })).toBeEnabled()
    expect(onMarkExisting).not.toHaveBeenCalled()
  })

  it('aguarda o resultado da nova busca antes de oferecer cadastro', async () => {
    hookMocks.useAttendanceRoster.mockReturnValue({
      data: {
        items: [{
          person: {
            firstName: 'Pessoa',
            id: 'old-id',
            surname: 'Anterior',
          },
        }],
        page: 0,
        totalElements: 1,
        totalPages: 1,
      },
      error: null,
      isError: false,
      isFetching: true,
      isLoading: false,
      isPlaceholderData: true,
      refetch: vi.fn(),
    })
    const user = userEvent.setup()

    render(
      <QuickOratorianoRegistration
        enabled
        onMarkExisting={vi.fn().mockResolvedValue(true)}
        oratorioId="oratorio-id"
      />,
    )

    await user.type(screen.getByLabelText('Nome'), 'Ana')
    await user.type(screen.getByLabelText('Sobrenome completo'), 'Souza')
    await user.click(screen.getByRole('button', {
      name: 'Conferir nome',
    }))

    expect(screen.queryByText('Pessoa Anterior')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {
      name: 'Cadastrar e marcar',
    })).not.toBeInTheDocument()
  })

  it('bloqueia criação quando o nome equivalente está em outra página', async () => {
    hookMocks.useExactOratorianoAttendanceMatch.mockReturnValue({
      data: {
        person: {
          firstName: 'JOAO',
          id: 'later-page-id',
          surname: 'SILVA',
        },
      },
      error: null,
      isError: false,
      isFetching: false,
      isLoading: false,
      isSuccess: true,
      refetch: vi.fn(),
    })
    hookMocks.useAttendanceRoster.mockReturnValue({
      data: {
        items: [{
          person: {
            firstName: 'João',
            id: 'similar-id',
            surname: 'Silveira',
          },
        }],
        page: 0,
        totalElements: 51,
        totalPages: 2,
      },
      error: null,
      isError: false,
      isFetching: false,
      isLoading: false,
      isPlaceholderData: false,
      refetch: vi.fn(),
    })
    const user = userEvent.setup()

    render(
      <QuickOratorianoRegistration
        enabled
        onMarkExisting={vi.fn().mockResolvedValue(true)}
        oratorioId="oratorio-id"
      />,
    )

    await user.type(screen.getByLabelText('Nome'), 'João')
    await user.type(screen.getByLabelText('Sobrenome completo'), 'Silva')
    await user.click(screen.getByRole('button', {
      name: 'Conferir nome',
    }))

    expect(screen.getByText('Use o cadastro encontrado.'))
      .toBeInTheDocument()
    expect(screen.getByRole('button', {
      name: 'Marcar cadastro encontrado',
    })).toBeEnabled()
    expect(screen.queryByRole('button', {
      name: 'Cadastrar e marcar',
    })).not.toBeInTheDocument()
  })
})
