import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ManageOratorianosPage } from './ManageOratorianosPage'

const pageMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  useAccountInfo: vi.fn(),
  useAccountPermissions: vi.fn(),
  useOratorianos: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children?: ReactNode }) => (
    <a href="/">{children}</a>
  ),
  useNavigate: () => pageMocks.navigate,
}))

vi.mock('@/features/account', () => ({
  useAccountInfo: pageMocks.useAccountInfo,
  useAccountPermissions: pageMocks.useAccountPermissions,
}))

vi.mock('../hooks/useOratorianos', () => ({
  useOratorianos: pageMocks.useOratorianos,
}))

vi.mock('../components/RegisterOratorianoDialog', () => ({
  RegisterOratorianoDialog: () => null,
}))

beforeEach(() => {
  pageMocks.navigate.mockReset()
  pageMocks.useAccountInfo.mockReset()
  pageMocks.useAccountInfo.mockReturnValue({ account: { id: 'account-id' } })
  pageMocks.useAccountPermissions.mockReset()
  pageMocks.useAccountPermissions.mockReturnValue({
    permissions: ['ORATORIANO_GET'],
  })
  pageMocks.useOratorianos.mockReset()
  pageMocks.useOratorianos.mockReturnValue({
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

describe('ManageOratorianosPage', () => {
  it('mostra e permite dispensar a confirmação de exclusão', async () => {
    const user = userEvent.setup()
    render(<ManageOratorianosPage initialDeletionNotice />)

    expect(screen.getByRole('status')).toHaveTextContent('Cadastro excluído.')
    expect(screen.getByRole('status')).toHaveTextContent(
      'As presenças anteriores permanecem no histórico.',
    )
    expect(screen.queryByText(/restaur/i)).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Dispensar confirmação' }),
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
