import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { oratorianoQueryKeys } from '../queryKeys'
import { OratorianoDetailPage } from './OratorianoDetailPage'

const pageMocks = vi.hoisted(() => ({
  deleteDialog: vi.fn(),
  formsSection: vi.fn(),
  navigate: vi.fn(),
  useAccountInfo: vi.fn(),
  useAccountPermissions: vi.fn(),
  useOratoriano: vi.fn(),
  useOratorianoAttendances: vi.fn(),
  useOratorianoAttendanceSummary: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: PropsWithChildren) => (
    <a href="/">{children}</a>
  ),
  useNavigate: () => pageMocks.navigate,
}))

vi.mock('@/features/account', () => ({
  useAccountInfo: pageMocks.useAccountInfo,
  useAccountPermissions: pageMocks.useAccountPermissions,
}))

vi.mock('@/features/manage/events', () => ({
  getEventStatusLabel: vi.fn(() => 'Concluído'),
}))

vi.mock('@/features/manage/oratorianoForms', () => ({
  OratorianoFormsSection: (props: {
    canManage: boolean
    canView: boolean
    oratorianoId: string
  }) => {
    pageMocks.formsSection(props)
    return (
      <section data-testid="oratoriano-forms-section">
        <h2>Fichas adicionais</h2>
      </section>
    )
  },
}))

vi.mock('../hooks/useOratorianos', () => ({
  useOratoriano: pageMocks.useOratoriano,
  useOratorianoAttendances: pageMocks.useOratorianoAttendances,
  useOratorianoAttendanceSummary: pageMocks.useOratorianoAttendanceSummary,
}))

vi.mock('../components/EditOratorianoDialog', () => ({
  EditOratorianoDialog: () => null,
}))

vi.mock('../components/DeleteOratorianoDialog', () => ({
  DeleteOratorianoDialog: (
    props: {
      onDeleted: () => void
      open: boolean
    },
  ) => {
    pageMocks.deleteDialog(props)
    return props.open ? (
      <button onClick={props.onDeleted} type="button">
        Confirmar exclusão simulada
      </button>
    ) : null
  },
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  })
}

function renderPage(queryClient = createQueryClient()) {
  const view = render(
    <QueryClientProvider client={queryClient}>
      <OratorianoDetailPage oratorianoId="oratoriano-id" />
    </QueryClientProvider>,
  )

  return { queryClient, ...view }
}

beforeEach(() => {
  pageMocks.deleteDialog.mockReset()
  pageMocks.formsSection.mockReset()
  pageMocks.navigate.mockReset()
  pageMocks.navigate.mockResolvedValue(undefined)
  pageMocks.useAccountInfo.mockReset()
  pageMocks.useAccountInfo.mockReturnValue({ account: { id: 'account-id' } })
  pageMocks.useAccountPermissions.mockReset()
  pageMocks.useAccountPermissions.mockReturnValue({
    permissions: ['ORATORIANO_GET'],
  })
  pageMocks.useOratoriano.mockReset()
  pageMocks.useOratoriano.mockReturnValue({
    data: {
      birthDate: '2014-03-12',
      firstName: 'Ana',
      id: 'oratoriano-id',
      surname: 'Souza',
    },
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  })
  pageMocks.useOratorianoAttendances.mockReset()
  pageMocks.useOratorianoAttendances.mockReturnValue({
    data: {
      items: [],
      page: 0,
      totalElements: 0,
      totalPages: 0,
    },
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  })
  pageMocks.useOratorianoAttendanceSummary.mockReset()
  pageMocks.useOratorianoAttendanceSummary.mockReturnValue({
    data: undefined,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  })
})

describe('OratorianoDetailPage', () => {
  it('mostra e dispensa o aviso de exclusão do rascunho no perfil', async () => {
    const user = userEvent.setup()
    const onNoticeDismiss = vi.fn()
    render(
      <QueryClientProvider client={createQueryClient()}>
        <OratorianoDetailPage
          initialNotice="oratoriano-form-rascunho-excluido"
          onNoticeDismiss={onNoticeDismiss}
          oratorianoId="oratoriano-id"
        />
      </QueryClientProvider>,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'O rascunho foi excluído.',
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'A ficha adicional não aparece mais no histórico.',
    )

    await user.click(
      screen.getByRole('button', { name: 'Dispensar confirmação' }),
    )

    expect(onNoticeDismiss).toHaveBeenCalledOnce()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
  it('posiciona fichas depois do cadastro e antes da frequência', () => {
    pageMocks.useAccountPermissions.mockReturnValue({
      permissions: ['ORATORIANO_GET', 'ORATORIANO_FORM_GET'],
    })

    renderPage()

    const registration = screen.getByText('Dados cadastrais')
    const forms = screen.getByRole('heading', { name: 'Fichas adicionais' })
    const frequency = screen.getByRole('heading', {
      name: 'Resumo de frequência',
    })

    expect(registration.compareDocumentPosition(forms))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(forms.compareDocumentPosition(frequency))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(pageMocks.formsSection).toHaveBeenCalledWith({
      canManage: false,
      canView: true,
      oratorianoId: 'oratoriano-id',
    })
  })

  it('não oferece exclusão sem a permissão de gestão', () => {
    renderPage()

    expect(
      screen.queryByRole('button', { name: 'Excluir cadastro' }),
    ).not.toBeInTheDocument()
  })

  it('navega antes de remover o detalhe excluído do cache', async () => {
    pageMocks.useAccountPermissions.mockReturnValue({
      permissions: ['ORATORIANO_GET', 'ORATORIANO_MANAGE'],
    })
    const user = userEvent.setup()
    const queryClient = createQueryClient()
    const removeQueries = vi.spyOn(queryClient, 'removeQueries')
    renderPage(queryClient)

    await user.click(
      screen.getByRole('button', { name: 'Excluir cadastro' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Confirmar exclusão simulada' }),
    )

    expect(pageMocks.navigate).toHaveBeenCalledWith({
      replace: true,
      search: { notice: 'oratoriano-excluido' },
      to: '/manage/oratorios/oratorianos',
    })
    await waitFor(() => {
      expect(removeQueries).toHaveBeenCalledWith({
        queryKey: oratorianoQueryKeys.detail('oratoriano-id'),
      })
    })
    expect(pageMocks.navigate.mock.invocationCallOrder[0])
      .toBeLessThan(removeQueries.mock.invocationCallOrder[0])
  })
})
