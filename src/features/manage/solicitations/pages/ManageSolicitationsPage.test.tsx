import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ManageSolicitationsPage } from './ManageSolicitationsPage'

const mocks = vi.hoisted(() => ({
  useAccountInfo: vi.fn(),
  useAccountPermissions: vi.fn(),
  useSolicitations: vi.fn(),
}))

vi.mock('@/features/account', () => ({
  useAccountInfo: mocks.useAccountInfo,
  useAccountPermissions: mocks.useAccountPermissions,
}))

vi.mock('../hooks/useSolicitations', () => ({
  useSolicitations: mocks.useSolicitations,
}))

vi.mock('../components/SolicitationDetailsDialog', () => ({
  SolicitationDetailsDialog: () => null,
}))

vi.mock('../components/SubmitSolicitationDialog', () => ({
  SubmitSolicitationDialog: () => <div data-testid="submit-solicitation-dialog" />,
}))

const approvedSolicitation = {
  account: {
    displayName: 'Ana Silva',
    email: 'ana@example.test',
    id: 'account-id',
  },
  firstName: 'Ana',
  id: 'solicitation-id',
  justification: 'Quero participar das atividades.',
  memberId: 'member-id',
  status: 'APPROVED',
  submittedAt: '2026-07-20T12:00:00.000Z',
  surname: 'Silva',
}

function solicitationQuery(items: typeof approvedSolicitation[]) {
  return {
    data: {
      items,
      page: 0,
      totalElements: items.length,
      totalPages: items.length > 0 ? 1 : 0,
    },
    error: null,
    isError: false,
    isFetching: false,
    isLoading: false,
    isSuccess: true,
    refetch: vi.fn(),
  }
}

beforeEach(() => {
  mocks.useAccountInfo.mockReturnValue({
    account: {
      displayName: 'Ana Silva',
      email: 'ana@example.test',
      id: 'account-id',
      permissions: [],
      roles: [],
    },
  })
  mocks.useAccountPermissions.mockReturnValue({ permissions: [] })
  mocks.useSolicitations.mockReset()
})

describe('ManageSolicitationsPage', () => {
  it('mantém o histórico e esconde a nova solicitação quando já existe memberId', () => {
    mocks.useSolicitations.mockReturnValue(
      solicitationQuery([approvedSolicitation]),
    )

    render(<ManageSolicitationsPage />)

    expect(
      screen.getByText('Quero participar das atividades.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Nova solicitação' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('submit-solicitation-dialog'),
    ).not.toBeInTheDocument()
    expect(mocks.useSolicitations).toHaveBeenCalledWith('APPROVED', 0, true)
  })

  it('mantém a nova solicitação disponível quando não existe memberId aprovado', () => {
    mocks.useSolicitations.mockReturnValue(solicitationQuery([]))

    render(<ManageSolicitationsPage />)

    expect(
      screen.getByRole('button', { name: 'Nova solicitação' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('submit-solicitation-dialog')).toBeInTheDocument()
  })
})
