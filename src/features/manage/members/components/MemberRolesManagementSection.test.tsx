import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { MemberListItem } from '../types'
import { MemberRolesManagementSection } from './MemberRolesManagementSection'

const hookMocks = vi.hoisted(() => ({
  useAccountRoles: vi.fn(),
  useUpdateMemberCoordinator: vi.fn(),
  useUpdateMemberOratorioCoordinator: vi.fn(),
}))

const coordinatorMutationMocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  reset: vi.fn(),
}))

const oratorioMutationMocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  reset: vi.fn(),
}))

vi.mock('@/features/manage/accounts', () => ({
  accountAdminQueryKeys: {
    all: ['account-administration'],
    roles: (accountId: string) => [
      'account-administration',
      accountId,
      'roles',
    ],
  },
  useAccountRoles: hookMocks.useAccountRoles,
}))

vi.mock('../hooks/useUpdateMemberCoordinator', () => ({
  useUpdateMemberCoordinator: hookMocks.useUpdateMemberCoordinator,
}))

vi.mock('../hooks/useUpdateMemberOratorioCoordinator', () => ({
  useUpdateMemberOratorioCoordinator:
    hookMocks.useUpdateMemberOratorioCoordinator,
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

const role = (name: string) => ({
  description: `Descrição de ${name}`,
  id: `${name.toLowerCase()}-id`,
  name,
  systemManaged: true,
})

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  })
}

function renderSection({
  canManageCoordinator = true,
  canManageOratorioCoordinator = true,
  selectedMember = member,
}: {
  canManageCoordinator?: boolean
  canManageOratorioCoordinator?: boolean
  selectedMember?: MemberListItem
} = {}) {
  const queryClient = createQueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
  const view = render(
    <MemberRolesManagementSection
      canManageCoordinator={canManageCoordinator}
      canManageOratorioCoordinator={canManageOratorioCoordinator}
      member={selectedMember}
    />,
    { wrapper },
  )

  return { queryClient, ...view }
}

beforeEach(() => {
  coordinatorMutationMocks.mutate.mockReset()
  coordinatorMutationMocks.reset.mockReset()
  oratorioMutationMocks.mutate.mockReset()
  oratorioMutationMocks.reset.mockReset()

  hookMocks.useAccountRoles.mockReset()
  hookMocks.useAccountRoles.mockReturnValue({
    data: { roles: [role('MEMBER')] },
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  })
  hookMocks.useUpdateMemberCoordinator.mockReset()
  hookMocks.useUpdateMemberCoordinator.mockReturnValue({
    error: null,
    isError: false,
    isPending: false,
    mutate: coordinatorMutationMocks.mutate,
    reset: coordinatorMutationMocks.reset,
  })
  hookMocks.useUpdateMemberOratorioCoordinator.mockReset()
  hookMocks.useUpdateMemberOratorioCoordinator.mockReturnValue({
    error: null,
    isError: false,
    isPending: false,
    mutate: oratorioMutationMocks.mutate,
    reset: oratorioMutationMocks.reset,
  })
})

describe('MemberRolesManagementSection', () => {
  it('concede a coordenação ao Member selecionado com justificativa', async () => {
    const user = userEvent.setup()
    renderSection()

    await user.click(screen.getByRole('button', { name: 'Conceder coordenação' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar concessão' }))

    expect(
      await screen.findByText('Informe o motivo da alteração.'),
    ).toBeInTheDocument()
    expect(coordinatorMutationMocks.mutate).not.toHaveBeenCalled()

    await user.type(
      screen.getByRole('textbox', { name: 'Motivo da alteração' }),
      'Necessidade do grupo',
    )
    await user.click(screen.getByRole('button', { name: 'Confirmar concessão' }))

    expect(coordinatorMutationMocks.mutate).toHaveBeenCalledWith(
      {
        action: 'grant',
        accountId: 'account-id',
        memberId: 'member-id',
        reason: 'Necessidade do grupo',
      },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    )
    expect(screen.queryByText('member-id')).not.toBeInTheDocument()
    expect(screen.queryByText('account-id')).not.toBeInTheDocument()
  })

  it('oferece remoção para os cargos já associados', () => {
    hookMocks.useAccountRoles.mockReturnValue({
      data: {
        roles: [role('MEMBER'), role('COORD'), role('ORATORIO_COORD')],
      },
      error: null,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    })

    renderSection()

    expect(
      screen.getByRole('button', { name: 'Remover coordenação' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Remover da coordenação do Oratório',
      }),
    ).toBeInTheDocument()
  })

  it('valida o limite Unicode da justificativa antes do envio', async () => {
    const user = userEvent.setup()
    renderSection({ canManageOratorioCoordinator: false })

    await user.click(screen.getByRole('button', { name: 'Conceder coordenação' }))
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Motivo da alteração' }),
      { target: { value: 'a'.repeat(2001) } },
    )
    await user.click(screen.getByRole('button', { name: 'Confirmar concessão' }))

    expect(
      await screen.findByText('O motivo deve ter no máximo 2.000 caracteres.'),
    ).toBeInTheDocument()
    expect(coordinatorMutationMocks.mutate).not.toHaveBeenCalled()
  })

  it('fecha o formulário local depois do sucesso', async () => {
    coordinatorMutationMocks.mutate.mockImplementation(
      (
        _variables: unknown,
        options: { onSuccess: () => void },
      ) => options.onSuccess(),
    )
    const user = userEvent.setup()
    renderSection({ canManageOratorioCoordinator: false })

    await user.click(screen.getByRole('button', { name: 'Conceder coordenação' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Motivo da alteração' }),
      'Necessidade do grupo',
    )
    await user.click(screen.getByRole('button', { name: 'Confirmar concessão' }))

    expect(
      screen.getByRole('button', { name: 'Conceder coordenação' }),
    ).toBeInTheDocument()
  })

  it('mantém a gestão indisponível quando o Member não possui Account vinculada', () => {
    renderSection({
      selectedMember: { ...member, accountId: null },
    })

    expect(
      screen.getByText('Este membro não possui uma conta vinculada.'),
    ).toBeInTheDocument()
    expect(hookMocks.useAccountRoles).toHaveBeenCalledWith(null, true)
    expect(
      screen.queryByRole('button', { name: /coordenação/i }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('member-id')).not.toBeInTheDocument()
  })

  it('bloqueia os cargos quando o Member está inativo', () => {
    renderSection({
      selectedMember: { ...member, status: 'INACTIVE' },
    })

    expect(
      screen.getByText('O vínculo com membro está inativo.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /coordenação/i }),
    ).not.toBeInTheDocument()
    expect(hookMocks.useAccountRoles).toHaveBeenCalledWith('account-id', false)
  })

  it('mantém os cargos indisponíveis para uma projeção inconsistente', () => {
    hookMocks.useAccountRoles.mockReturnValue({
      data: { roles: [role('MEMBER'), role('VISITOR')] },
      error: null,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    })

    renderSection()

    expect(
      screen.getByText('O vínculo com membro está inconsistente.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /coordenação/i }),
    ).not.toBeInTheDocument()
  })

  it('não expõe ações ou identificadores quando a leitura dos cargos é proibida', () => {
    const forbiddenError = new AxiosError('diagnóstico técnico')
    forbiddenError.response = { status: 403 } as never
    hookMocks.useAccountRoles.mockReturnValue({
      data: undefined,
      error: forbiddenError,
      isError: true,
      isLoading: false,
      refetch: vi.fn(),
    })

    renderSection()

    expect(
      screen.getByText('A gestão de cargos não está disponível.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('diagnóstico técnico')).not.toBeInTheDocument()
    expect(screen.queryByText('member-id')).not.toBeInTheDocument()
    expect(screen.queryByText('account-id')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /coordenação/i }),
    ).not.toBeInTheDocument()
  })
})
