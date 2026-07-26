import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Account } from '../api/accounts'
import { AccountDetailsDialog } from './AccountDetailsDialog'

const hookMocks = vi.hoisted(() => ({
  useAccountRoles: vi.fn(),
}))

vi.mock('../hooks/useAccountAdministration', () => hookMocks)

vi.mock('./AccountCoordinatorTransitionSection', () => ({
  AccountCoordinatorTransitionSection: () => (
    <div>Gestão da coordenação geral</div>
  ),
}))

vi.mock('./AccountOratorioCoordinatorTransitionSection', () => ({
  AccountOratorioCoordinatorTransitionSection: ({
    hasActiveMemberProjection,
    isOratorioCoordinator,
  }: {
    hasActiveMemberProjection: boolean
    isOratorioCoordinator: boolean
  }) => (
    <div
      data-active-member-projection={String(hasActiveMemberProjection)}
      data-oratorio-coordinator={String(isOratorioCoordinator)}
    >
      Gestão da coordenação do Oratório
    </div>
  ),
}))

const account: Account = {
  displayName: 'Maria Silva',
  email: 'maria@example.test',
  id: 'account-id',
  roles: [],
}

const role = (name: string) => ({
  description: `Descrição de ${name}`,
  id: `${name.toLowerCase()}-id`,
  name,
  systemManaged: true,
})

beforeEach(() => {
  hookMocks.useAccountRoles.mockReset()
  hookMocks.useAccountRoles.mockReturnValue({
    data: { roles: [role('MEMBER')] },
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  })
})

describe('AccountDetailsDialog', () => {
  it('não mostra a gestão do Oratório sem a permissão dedicada', () => {
    render(
      <AccountDetailsDialog
        account={account}
        canManageMemberTransitions={false}
        canManageOratorioCoordinators={false}
        onClose={vi.fn()}
      />,
    )

    expect(
      screen.queryByText('Gestão da coordenação do Oratório'),
    ).not.toBeInTheDocument()
  })

  it('deriva a ação e a projeção ativa dos papéis autoritativos', () => {
    hookMocks.useAccountRoles.mockReturnValue({
      data: { roles: [role('MEMBER'), role('ORATORIO_COORD')] },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    })

    render(
      <AccountDetailsDialog
        account={account}
        canManageMemberTransitions={false}
        canManageOratorioCoordinators
        onClose={vi.fn()}
      />,
    )

    const section = screen.getByText('Gestão da coordenação do Oratório')
    expect(section).toHaveAttribute('data-active-member-projection', 'true')
    expect(section).toHaveAttribute('data-oratorio-coordinator', 'true')
  })

  it('marca como inconsistente a projeção que também contém visitante', () => {
    hookMocks.useAccountRoles.mockReturnValue({
      data: { roles: [role('MEMBER'), role('VISITOR')] },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    })

    render(
      <AccountDetailsDialog
        account={account}
        canManageMemberTransitions={false}
        canManageOratorioCoordinators
        onClose={vi.fn()}
      />,
    )

    expect(
      screen.getByText('Gestão da coordenação do Oratório'),
    ).toHaveAttribute('data-active-member-projection', 'false')
  })
})
