import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import { StrictMode, type PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { InvalidOratorianoFormDataError } from '../parseFormDetail'
import { oratorianoFormQueryKeys } from '../queryKeys'
import { OratorianoFormPage } from './OratorianoFormPage'

const pageMocks = vi.hoisted(() => ({
  useAccountInfo: vi.fn(),
  useAccountPermissions: vi.fn(),
  useOratoriano: vi.fn(),
  useOratorianoFormDetail: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: PropsWithChildren) => (
    <a href="/perfil-sintetico">{children}</a>
  ),
}))

vi.mock('@/features/account', () => ({
  useAccountInfo: pageMocks.useAccountInfo,
  useAccountPermissions: pageMocks.useAccountPermissions,
}))

vi.mock('@/features/manage/oratorianos', () => ({
  getOratorianoFullName: (value?: {
    firstName?: string
    surname?: string
  }) => [value?.firstName, value?.surname].filter(Boolean).join(' ')
    || 'Nome não informado',
  useOratoriano: pageMocks.useOratoriano,
}))

vi.mock('../hooks/useOratorianoForms', () => ({
  useOratorianoFormDetail: pageMocks.useOratorianoFormDetail,
}))

const refetch = vi.fn()

function formDetail(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: '2026-03-15T21:42:00Z',
    data: {
      address: {
        addressLine: 'Rua das Acácias',
        addressNumber: '120',
        city: 'São Paulo',
        neighborhood: 'Jardim Esperança',
      },
      birthDate: '2012-09-17',
      declarations: {
        formReviewed: true,
        imageAndVoiceAuthorizationAccepted: false,
      },
      firstName: 'Marina',
      health: {
        allergies: { answer: 'NO' },
        medicineUse: {
          answer: 'YES',
          explanation: 'Uso acompanhado pela família.',
        },
      },
      responsible: {
        atLeast18: true,
        firstName: 'Renata',
        relationship: 'MOTHER',
        surname: 'Alves',
      },
      schoolGrade: '8º ano',
      schoolName: 'Escola Municipal Horizonte',
      signedOn: '2026-03-14',
      surname: 'Alves',
    },
    draftRevision: 7,
    origin: 'DIRECT_SYSTEM_ENTRY',
    signedOn: '2026-03-14',
    status: 'DRAFT',
    version: 3,
    ...overrides,
  }
}

function setDetailQuery(overrides: Record<string, unknown> = {}) {
  pageMocks.useOratorianoFormDetail.mockReturnValue({
    data: formDetail(),
    error: null,
    isError: false,
    isLoading: false,
    refetch,
    ...overrides,
  })
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function renderPage({
  openedExplicitly = true,
  queryClient = createQueryClient(),
  strict = false,
}: {
  openedExplicitly?: boolean
  queryClient?: QueryClient
  strict?: boolean
} = {}) {
  const content = (
    <QueryClientProvider client={queryClient}>
      <OratorianoFormPage
        formId="form-id"
        openedExplicitly={openedExplicitly}
        oratorianoId="oratoriano-id"
      />
    </QueryClientProvider>
  )
  const view = render(strict ? <StrictMode>{content}</StrictMode> : content)

  return { queryClient, ...view }
}

beforeEach(() => {
  refetch.mockReset()
  pageMocks.useAccountInfo.mockReset()
  pageMocks.useAccountInfo.mockReturnValue({ account: { id: 'account-id' } })
  pageMocks.useAccountPermissions.mockReset()
  pageMocks.useAccountPermissions.mockReturnValue({
    permissions: ['ORATORIANO_FORM_GET', 'ORATORIANO_GET'],
  })
  pageMocks.useOratoriano.mockReset()
  pageMocks.useOratoriano.mockReturnValue({
    data: { firstName: 'Marina', surname: 'Alves' },
    isError: false,
    isLoading: false,
  })
  pageMocks.useOratorianoFormDetail.mockReset()
  setDetailQuery()
})

describe('OratorianoFormPage', () => {
  it('mantém um carregamento estável e protegido', () => {
    setDetailQuery({ data: undefined, isLoading: true })

    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando ficha adicional…',
    )
    expect(screen.getByRole('link', {
      name: 'Voltar ao perfil do Oratoriano',
    })).toBeInTheDocument()
  })

  it('apresenta o resumo e as cinco áreas da alternativa A', () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Marina Alves' }))
      .toBeInTheDocument()
    expect(screen.getByText('Ficha adicional · versão 3')).toBeInTheDocument()
    expect(screen.getByText('Rascunho')).toBeInTheDocument()
    expect(screen.getByText('Preenchimento no sistema')).toBeInTheDocument()
    expect(screen.getByText('Revisão')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Identificação e endereço' }))
      .toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Escola, responsável e família' }))
      .toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Informações de saúde' }))
      .toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Declarações' }))
      .toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Assinatura' }))
      .toBeInTheDocument()
    expect(screen.getByText('Uso acompanhado pela família.'))
      .toBeInTheDocument()
  })

  it('mantém DRAFT somente leitura e não antecipa controles futuros', () => {
    renderPage()

    expect(screen.getByText(
      'Esta ficha está em rascunho e permanece somente para consulta nesta etapa.',
    )).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    for (const action of [
      'Salvar rascunho',
      'Excluir ficha',
      'Gerar PDF',
      'Enviar anexo',
      'Concluir ficha',
      'Revogar ficha',
      'Imprimir',
    ]) {
      expect(screen.queryByRole('button', { name: action }))
        .not.toBeInTheDocument()
    }
  })

  it.each([
    ['COMPLETED', 'Concluída', 'Esta ficha foi concluída'],
    ['SUPERSEDED', 'Substituída', 'Esta é uma versão histórica substituída'],
    ['REVOKED', 'Revogada', 'Esta ficha foi revogada'],
  ])('mantém %s somente leitura', (status, label, description) => {
    setDetailQuery({ data: formDetail({ status }) })

    renderPage()

    expect(screen.getByText(label)).toBeInTheDocument()
    expect(screen.getByText(description, { exact: false })).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('apresenta valores ausentes deliberadamente sem formulário vazio', () => {
    setDetailQuery({
      data: formDetail({
        createdAt: undefined,
        data: {},
        draftRevision: undefined,
        signedOn: undefined,
      }),
    })

    renderPage()

    expect(screen.getAllByText('Não informado').length).toBeGreaterThan(5)
    expect(screen.getByText('Não informada')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('usa fallback neutro para situação e origem futuras', () => {
    setDetailQuery({
      data: formDetail({ origin: 'FUTURE_ORIGIN', status: 'FUTURE_STATUS' }),
    })

    renderPage()

    expect(screen.getByText('Situação não identificada')).toBeInTheDocument()
    expect(screen.getByText('Origem não identificada')).toBeInTheDocument()
    expect(document.body).not.toHaveTextContent('FUTURE_')
  })

  it('não consulta nem apresenta conteúdo sem permissão', () => {
    pageMocks.useAccountPermissions.mockReturnValue({ permissions: [] })

    renderPage()

    expect(screen.getByText(
      'Sua conta não pode consultar esta ficha adicional.',
    )).toBeInTheDocument()
    expect(pageMocks.useOratorianoFormDetail).toHaveBeenCalledWith(
      'oratoriano-id',
      'form-id',
      false,
      true,
    )
    expect(screen.queryByText('Marina Alves')).not.toBeInTheDocument()
  })

  it('exige que a abertura tenha ocorrido por navegação explícita', () => {
    renderPage({ openedExplicitly: false })

    expect(pageMocks.useOratorianoFormDetail).toHaveBeenCalledWith(
      'oratoriano-id',
      'form-id',
      true,
      false,
    )
    expect(screen.getByText(
      'Sua conta não pode consultar esta ficha adicional.',
    )).toBeInTheDocument()
  })

  it('trata resposta proibida sem retry', () => {
    const error = Object.assign(new AxiosError(), {
      response: { status: 403 },
    })
    setDetailQuery({ data: undefined, error, isError: true })

    renderPage()

    expect(screen.getByText(
      'Sua conta não pode consultar esta ficha adicional.',
    )).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar novamente' }))
      .not.toBeInTheDocument()
  })

  it('trata recurso não encontrado sem expor o identificador', () => {
    const error = Object.assign(new AxiosError(), {
      response: { status: 404 },
    })
    setDetailQuery({ data: undefined, error, isError: true })

    renderPage()

    expect(screen.getByText('Ficha adicional não encontrada.'))
      .toBeInTheDocument()
    expect(document.body).not.toHaveTextContent('form-id')
  })

  it('permite tentar novamente após erro sem expor diagnóstico', async () => {
    const user = userEvent.setup()
    setDetailQuery({
      data: undefined,
      error: new Error('payload privado e stack sintética'),
      isError: true,
    })

    renderPage()
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(refetch).toHaveBeenCalledOnce()
    expect(document.body).not.toHaveTextContent('payload privado')
    expect(document.body).not.toHaveTextContent('stack sintética')
  })

  it('mostra erro seguro de parsing sem inicializar conteúdo vazio', async () => {
    const user = userEvent.setup()
    setDetailQuery({
      data: undefined,
      error: new InvalidOratorianoFormDataError(),
      isError: true,
    })

    renderPage()

    expect(screen.getByText(
      'Não foi possível validar o conteúdo da ficha.',
    )).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Identificação e endereço' }))
      .not.toBeInTheDocument()
    expect(document.body).not.toHaveTextContent('Invalid Oratoriano form data')
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('remove somente a query exata ao sair sem refetch acidental', async () => {
    const queryClient = createQueryClient()
    const removeQueries = vi.spyOn(queryClient, 'removeQueries')
    const view = renderPage({ queryClient })

    view.unmount()

    await waitFor(() => {
      expect(removeQueries).toHaveBeenCalledWith({
        exact: true,
        queryKey: oratorianoFormQueryKeys.detail(
          'oratoriano-id',
          'form-id',
        ),
      })
    })
    expect(refetch).not.toHaveBeenCalled()
  })

  it('cancela o cleanup intermediário do Strict Mode', async () => {
    const queryClient = createQueryClient()
    const removeQueries = vi.spyOn(queryClient, 'removeQueries')

    renderPage({ queryClient, strict: true })

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(removeQueries).not.toHaveBeenCalled()
    expect(refetch).not.toHaveBeenCalled()
  })

  it('não apresenta UUIDs ou códigos de permissão', () => {
    setDetailQuery({
      data: formDetail({
        createdBy: { id: '019fb82d-2222-7222-8222-222222222222' },
        id: '019fb82d-3333-7333-8333-333333333333',
        oratorianoId: '019fb82d-4444-7444-8444-444444444444',
      }),
    })

    renderPage()

    expect(document.body).not.toHaveTextContent('019fb82d')
    expect(document.body).not.toHaveTextContent('ORATORIANO_FORM_GET')
  })
})
