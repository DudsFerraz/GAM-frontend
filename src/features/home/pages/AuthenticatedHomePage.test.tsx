import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthenticatedHomePage } from './AuthenticatedHomePage'

const accountMocks = vi.hoisted(() => ({
  getMainRoleLabel: vi.fn(),
  useAccountInfo: vi.fn(),
}))

vi.mock('@/features/account', () => accountMocks)

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      addEventListener: vi.fn(),
      matches: false,
      removeEventListener: vi.fn(),
    })),
  )
  accountMocks.getMainRoleLabel.mockReturnValue('Coordenação')
  accountMocks.useAccountInfo.mockReturnValue({
    account: {
      displayName: 'Mariana Coordenadora',
      roles: [{ name: 'COORD' }],
    },
    isLoading: false,
  })
})

describe('AuthenticatedHomePage', () => {
  it('mostra somente o painel com saudação e tipo de acesso', () => {
    render(<AuthenticatedHomePage />)

    expect(screen.getByRole('heading', { name: 'Olá, Mariana!' })).toBeInTheDocument()
    expect(screen.getByText('Seu acesso')).toBeInTheDocument()
    expect(screen.getByText('Coordenação')).toBeInTheDocument()
    expect(screen.queryByText('Acesso rápido')).not.toBeInTheDocument()
    expect(screen.queryByText('Próximos eventos')).not.toBeInTheDocument()
    expect(screen.queryByText('Solicitações pendentes')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Ver programação' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Minhas solicitações' })).not.toBeInTheDocument()
    expect(
      screen.queryByText('Acompanhe as atividades, encontre o que precisa e continue fazendo parte da nossa comunidade.'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Cada atividade, cadastro e encontro ajuda a fortalecer uma comunidade mais presente, acolhedora e participativa.'),
    ).not.toBeInTheDocument()
  })

  it('mantém o estado de carregamento da conta', () => {
    accountMocks.useAccountInfo.mockReturnValue({
      account: null,
      isLoading: true,
    })

    render(<AuthenticatedHomePage />)

    expect(screen.getByText('Carregando seu painel...')).toBeInTheDocument()
  })

  it('mantém o estado de painel indisponível sem uma conta', () => {
    accountMocks.useAccountInfo.mockReturnValue({
      account: null,
      isLoading: false,
    })

    render(<AuthenticatedHomePage />)

    expect(screen.getByText('Painel indisponível.')).toBeInTheDocument()
  })

  it.each([
    {
      account: {
        displayName: '   ',
        roles: [{ name: 'COORD' }],
      },
      caseName: 'nome em branco',
    },
    {
      account: {
        displayName: 'Mariana Coordenadora',
        roles: [],
      },
      caseName: 'tipo de acesso ausente',
    },
  ])('não inventa identidade quando a conta possui $caseName', ({ account }) => {
    accountMocks.useAccountInfo.mockReturnValue({
      account,
      isLoading: false,
    })

    render(<AuthenticatedHomePage />)

    expect(screen.getByText('Os dados essenciais da conta não estão disponíveis.')).toBeInTheDocument()
    expect(screen.queryByText(/Olá,/)).not.toBeInTheDocument()
  })
})
