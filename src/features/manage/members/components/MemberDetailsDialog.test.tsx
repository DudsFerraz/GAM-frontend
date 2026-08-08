import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { MemberListItem } from '../types'
import { MemberDetailsDialog } from './MemberDetailsDialog'

const dialogMocks = vi.hoisted(() => ({
  memberRolesManagementSection: vi.fn(),
  useUpdateMemberStatus: vi.fn(),
}))

vi.mock('../hooks/useUpdateMemberStatus', () => ({
  useUpdateMemberStatus: dialogMocks.useUpdateMemberStatus,
}))

vi.mock('./MemberRolesManagementSection', () => ({
  MemberRolesManagementSection: (props: unknown) => {
    dialogMocks.memberRolesManagementSection(props)
    return <div>Gestão de cargos</div>
  },
}))

const member: MemberListItem = {
  accountId: 'account-id',
  birthDate: '1990-01-01',
  displayName: 'Mariana Coordenadora',
  email: 'mariana@example.test',
  firstName: 'Mariana',
  id: 'member-id',
  phoneNumber: '+5519999999999',
  status: 'ACTIVE',
  surname: 'Alves',
}

beforeEach(() => {
  dialogMocks.memberRolesManagementSection.mockReset()
  dialogMocks.useUpdateMemberStatus.mockReset()
  dialogMocks.useUpdateMemberStatus.mockReturnValue({
    error: null,
    isError: false,
    isPending: false,
    mutate: vi.fn(),
    reset: vi.fn(),
  })
})

describe('MemberDetailsDialog', () => {
  it('não monta a gestão de cargos sem uma capacidade de coordenação', () => {
    render(
      <MemberDetailsDialog
        canManageCoordinator={false}
        canManageMemberStatus
        canManageOratorioCoordinators={false}
        member={member}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText('Situação do membro')).toBeInTheDocument()
    expect(screen.queryByText('Gestão de cargos')).not.toBeInTheDocument()
    expect(dialogMocks.memberRolesManagementSection).not.toHaveBeenCalled()
  })
})
