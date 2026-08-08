import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ManageAccountsPage } from './ManageAccountsPage'

const pageMocks = vi.hoisted(() => ({
  accountDetailsDialog: vi.fn(),
  useSearchAccounts: vi.fn(),
}))

vi.mock('@/features/account', () => ({
  getRoleLabel: vi.fn(() => 'Tipo de acesso'),
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
  it('mantém o diálogo restrito à consulta da conta selecionada', () => {
    render(<ManageAccountsPage />)

    const props = pageMocks.accountDetailsDialog.mock.calls.at(-1)?.[0]

    expect(props).toEqual({
      account: null,
      onClose: expect.any(Function),
    })
  })
})
