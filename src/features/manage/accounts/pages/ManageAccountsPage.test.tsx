import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ManageAccountsPage } from './ManageAccountsPage'

const pageMocks = vi.hoisted(() => ({
  accountDetailsDialog: vi.fn(),
  useAccountInfo: vi.fn(),
  useAccountPermissions: vi.fn(),
  useSearchAccounts: vi.fn(),
}))

vi.mock('@/features/account', () => ({
  getRoleLabel: vi.fn(() => 'Tipo de acesso'),
  useAccountInfo: pageMocks.useAccountInfo,
  useAccountPermissions: pageMocks.useAccountPermissions,
}))

vi.mock('../hooks/useAccountAdministration', () => ({
  useSearchAccounts: pageMocks.useSearchAccounts,
}))

vi.mock('../components/AccountDetailsDialog', () => ({
  AccountDetailsDialog: (props: unknown) => {
    pageMocks.accountDetailsDialog(props)
    return null
  },
}))

beforeEach(() => {
  pageMocks.accountDetailsDialog.mockReset()
  pageMocks.useAccountInfo.mockReset()
  pageMocks.useAccountInfo.mockReturnValue({ account: { id: 'current-account' } })
  pageMocks.useAccountPermissions.mockReset()
  pageMocks.useAccountPermissions.mockReturnValue({ permissions: [] })
  pageMocks.useSearchAccounts.mockReset()
  pageMocks.useSearchAccounts.mockReturnValue({
    data: {
      items: [],
      page: 0,
      totalElements: 0,
      totalPages: 0,
    },
    isError: false,
    isFetching: false,
    isLoading: false,
  })
})

describe('ManageAccountsPage', () => {
  it('usa somente a permissão dedicada para gerir a coordenação do Oratório', () => {
    pageMocks.useAccountPermissions.mockReturnValue({
      permissions: ['ORATORIO_COORD_MANAGE'],
    })

    render(<ManageAccountsPage />)

    expect(pageMocks.accountDetailsDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        canManageMemberTransitions: false,
        canManageOratorioCoordinators: true,
      }),
    )
  })

  it('não usa a permissão de ativação de membros como substituta', () => {
    pageMocks.useAccountPermissions.mockReturnValue({
      permissions: ['MEMBER_ACTIVATION'],
    })

    render(<ManageAccountsPage />)

    expect(pageMocks.accountDetailsDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        canManageMemberTransitions: true,
        canManageOratorioCoordinators: false,
      }),
    )
  })
})
