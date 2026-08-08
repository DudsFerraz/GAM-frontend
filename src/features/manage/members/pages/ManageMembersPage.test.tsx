import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ManageMembersPage } from './ManageMembersPage'

const pageMocks = vi.hoisted(() => ({
  memberDetailsDialog: vi.fn(),
  navigate: vi.fn(),
  useAccountInfo: vi.fn(),
  useAccountPermissions: vi.fn(),
  useSearchMembers: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => pageMocks.navigate,
}))

vi.mock('@/features/account', () => ({
  useAccountInfo: pageMocks.useAccountInfo,
  useAccountPermissions: pageMocks.useAccountPermissions,
}))

vi.mock('../hooks/useSearchMembers', () => ({
  useSearchMembers: pageMocks.useSearchMembers,
}))

vi.mock('../components/MemberDetailsDialog', () => ({
  MemberDetailsDialog: (props: unknown) => {
    pageMocks.memberDetailsDialog(props)
    return null
  },
}))

vi.mock('../components/RegisterMemberDialog', () => ({
  RegisterMemberDialog: () => null,
}))

beforeEach(() => {
  pageMocks.memberDetailsDialog.mockReset()
  pageMocks.navigate.mockReset()
  pageMocks.useAccountInfo.mockReset()
  pageMocks.useAccountInfo.mockReturnValue({ account: { id: 'current-account' } })
  pageMocks.useAccountPermissions.mockReset()
  pageMocks.useAccountPermissions.mockReturnValue({ permissions: [] })
  pageMocks.useSearchMembers.mockReset()
  pageMocks.useSearchMembers.mockReturnValue({
    data: {
      items: [],
      page: 0,
      totalElements: 0,
      totalPages: 0,
    },
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  })
})

describe('ManageMembersPage', () => {
  it('separa as permissões de situação e dos dois cargos', () => {
    pageMocks.useAccountPermissions.mockReturnValue({
      permissions: [
        'MEMBER_ACTIVATION',
        'COORDINATOR_MANAGE',
        'ORATORIO_COORD_MANAGE',
      ],
    })

    render(<ManageMembersPage />)

    expect(pageMocks.memberDetailsDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        canManageCoordinator: true,
        canManageMemberStatus: true,
        canManageOratorioCoordinators: true,
      }),
    )
  })

  it('não usa MEMBER_ACTIVATION como permissão de coordenação', () => {
    pageMocks.useAccountPermissions.mockReturnValue({
      permissions: ['MEMBER_ACTIVATION'],
    })

    render(<ManageMembersPage />)

    expect(pageMocks.memberDetailsDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        canManageCoordinator: false,
        canManageMemberStatus: true,
        canManageOratorioCoordinators: false,
      }),
    )
  })
})
