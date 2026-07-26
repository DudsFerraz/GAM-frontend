import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AccountOratorioCoordinatorTransitionSection } from './AccountOratorioCoordinatorTransitionSection'

const hookMocks = vi.hoisted(() => ({
  useMemberByAccountEmail: vi.fn(),
  useUpdateMemberOratorioCoordinator: vi.fn(),
}))

const mutationMocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  reset: vi.fn(),
}))

vi.mock('@/features/manage/members', () => hookMocks)

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  })
}

function renderSection({
  hasActiveMemberProjection = true,
  isOratorioCoordinator = false,
}: {
  hasActiveMemberProjection?: boolean
  isOratorioCoordinator?: boolean
} = {}) {
  const queryClient = createQueryClient()
  const view = render(
    <QueryClientProvider client={queryClient}>
      <AccountOratorioCoordinatorTransitionSection
        accountEmail="maria@example.test"
        accountId="account-id"
        hasActiveMemberProjection={hasActiveMemberProjection}
        isOratorioCoordinator={isOratorioCoordinator}
      />
    </QueryClientProvider>,
  )

  return { queryClient, ...view }
}

beforeEach(() => {
  mutationMocks.mutate.mockReset()
  mutationMocks.reset.mockReset()
  hookMocks.useMemberByAccountEmail.mockReset()
  hookMocks.useMemberByAccountEmail.mockReturnValue({
    data: { id: 'member-id', status: 'ACTIVE' },
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  })
  hookMocks.useUpdateMemberOratorioCoordinator.mockReset()
  hookMocks.useUpdateMemberOratorioCoordinator.mockReturnValue({
    error: null,
    isError: false,
    isPending: false,
    mutate: mutationMocks.mutate,
    reset: mutationMocks.reset,
  })
})

describe('AccountOratorioCoordinatorTransitionSection', () => {
  it('designa o membro ativo com motivo, sem pedir identificador técnico', async () => {
    const user = userEvent.setup()
    renderSection()

    await user.click(
      screen.getByRole('button', {
        name: 'Designar como coordenação do Oratório',
      }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Confirmar designação' }),
    )

    expect(
      await screen.findByText('Informe o motivo da alteração.'),
    ).toBeInTheDocument()
    expect(mutationMocks.mutate).not.toHaveBeenCalled()

    await user.type(
      screen.getByRole('textbox', { name: 'Motivo da alteração' }),
      'Apoio contínuo às atividades',
    )
    await user.click(
      screen.getByRole('button', { name: 'Confirmar designação' }),
    )

    expect(mutationMocks.mutate).toHaveBeenCalledWith(
      {
        action: 'grant',
        memberId: 'member-id',
        reason: 'Apoio contínuo às atividades',
      },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    )
    expect(screen.queryByText('member-id')).not.toBeInTheDocument()
  })

  it('oferece remoção quando a responsabilidade já está associada', async () => {
    const user = userEvent.setup()
    renderSection({ isOratorioCoordinator: true })

    await user.click(
      screen.getByRole('button', {
        name: 'Remover da coordenação do Oratório',
      }),
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Motivo da alteração' }),
      'Reorganização da equipe',
    )
    await user.click(
      screen.getByRole('button', { name: 'Confirmar remoção' }),
    )

    expect(mutationMocks.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'revoke', memberId: 'member-id' }),
      expect.any(Object),
    )
  })

  it('valida o limite em caracteres Unicode antes do envio', async () => {
    const user = userEvent.setup()
    renderSection()

    await user.click(
      screen.getByRole('button', {
        name: 'Designar como coordenação do Oratório',
      }),
    )
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Motivo da alteração' }),
      { target: { value: 'a'.repeat(2001) } },
    )
    await user.click(
      screen.getByRole('button', { name: 'Confirmar designação' }),
    )

    expect(
      await screen.findByText(
        'O motivo deve ter no máximo 2.000 caracteres.',
      ),
    ).toBeInTheDocument()
    expect(mutationMocks.mutate).not.toHaveBeenCalled()
  })

  it.each([
    {
      member: null,
      projection: true,
      title: 'Esta conta não está vinculada a um membro.',
    },
    {
      member: { id: 'member-id', status: 'INACTIVE' as const },
      projection: true,
      title: 'O vínculo com membro está inativo.',
    },
    {
      member: { id: 'member-id', status: 'ACTIVE' as const },
      projection: false,
      title: 'O vínculo com membro está inconsistente.',
    },
  ])('bloqueia a ação quando: $title', ({ member, projection, title }) => {
    hookMocks.useMemberByAccountEmail.mockReturnValue({
      data: member,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    })

    renderSection({ hasActiveMemberProjection: projection })

    expect(screen.getByText(title)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /coordenação do Oratório/i }),
    ).not.toBeInTheDocument()
  })

  it('não pede identificador quando a consulta do vínculo é proibida', () => {
    const forbiddenError = new AxiosError('diagnóstico técnico')
    forbiddenError.response = { status: 403 } as never
    hookMocks.useMemberByAccountEmail.mockReturnValue({
      data: undefined,
      error: forbiddenError,
      isError: true,
      isLoading: false,
      refetch: vi.fn(),
    })

    renderSection()

    expect(
      screen.getByText(
        'Não é possível selecionar este membro com segurança.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/a ação permanecerá indisponível/),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Tentar novamente' }),
    ).not.toBeInTheDocument()
  })

  it('atualiza papéis e buscas depois do sucesso', async () => {
    mutationMocks.mutate.mockImplementation(
      (
        _variables: unknown,
        options: { onSuccess: () => void },
      ) => options.onSuccess(),
    )
    const user = userEvent.setup()
    const { queryClient } = renderSection()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

    await user.click(
      screen.getByRole('button', {
        name: 'Designar como coordenação do Oratório',
      }),
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Motivo da alteração' }),
      'Apoio ao Oratório',
    )
    await user.click(
      screen.getByRole('button', { name: 'Confirmar designação' }),
    )

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['account-administration', 'account-id', 'roles'],
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['account-administration', 'search'],
    })
  })
})
