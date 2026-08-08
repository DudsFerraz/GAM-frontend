import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Account } from '../api/accounts'
import { AccountDetailsDialog } from './AccountDetailsDialog'

const hookMocks = vi.hoisted(() => ({
  useAccountRoles: vi.fn(),
}))

vi.mock('../hooks/useAccountAdministration', () => hookMocks)

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
    data: {
      roles: [role('MEMBER'), role('COORD'), role('ORATORIO_COORD')],
    },
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  })
})

describe('AccountDetailsDialog', () => {
  it('apresenta os cargos associados sem oferecer ações de gestão', () => {
    render(
      <AccountDetailsDialog account={account} onClose={vi.fn()} />,
    )

    expect(screen.getByRole('heading', { name: 'Tipos de acesso' })).toBeInTheDocument()
    expect(screen.getByText('Membro')).toBeInTheDocument()
    expect(screen.getByText('Coordenação')).toBeInTheDocument()
    expect(screen.getByText('Coordenação do Oratório')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /conceder|designar|remover/i }),
    ).not.toBeInTheDocument()
  })
})
