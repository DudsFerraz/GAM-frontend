import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OratorianoFormsSection } from './OratorianoFormsSection'

const hookMocks = vi.hoisted(() => ({
  useOratorianoFormHistory: vi.fn(),
}))

vi.mock('../hooks/useOratorianoForms', () => hookMocks)

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    'aria-label': ariaLabel,
    params,
    to,
  }: {
    'aria-label'?: string
    params: { formId: string; oratorianoId: string }
    to: string
  }) => (
    <a
      aria-label={ariaLabel}
      data-form-id={params.formId}
      data-oratoriano-id={params.oratorianoId}
      data-to={to}
      href="/ficha-sintetica"
    />
  ),
}))

const refetch = vi.fn()

function setHistoryQuery(overrides: Record<string, unknown> = {}) {
  hookMocks.useOratorianoFormHistory.mockReturnValue({
    data: undefined,
    error: null,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch,
    ...overrides,
  })
}

function renderSection(canView = true) {
  return render(
    <OratorianoFormsSection
      canView={canView}
      oratorianoId="019fb82d-1111-7111-8111-111111111111"
    />,
  )
}

beforeEach(() => {
  refetch.mockReset()
  hookMocks.useOratorianoFormHistory.mockReset()
  setHistoryQuery({
    data: { items: [], page: 0, totalElements: 0, totalPages: 0 },
  })
})

describe('OratorianoFormsSection', () => {
  it('mostra o carregamento local da seção', () => {
    setHistoryQuery({ isLoading: true })

    renderSection()

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando fichas adicionais…',
    )
  })

  it('mostra o estado vazio', () => {
    renderSection()

    expect(screen.getByText('Nenhuma ficha adicional registrada.'))
      .toBeInTheDocument()
  })

  it('isola o erro e permite tentar novamente', async () => {
    const user = userEvent.setup()
    setHistoryQuery({ error: new Error('diagnóstico'), isError: true })

    renderSection()
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(refetch).toHaveBeenCalledOnce()
    expect(screen.queryByText('diagnóstico')).not.toBeInTheDocument()
  })

  it('mostra acesso indisponível e mantém a consulta desabilitada', () => {
    renderSection(false)

    expect(screen.getByText(
      'Sua conta não pode consultar o histórico de fichas adicionais.',
    )).toBeInTheDocument()
    expect(hookMocks.useOratorianoFormHistory).toHaveBeenCalledWith(
      '019fb82d-1111-7111-8111-111111111111',
      0,
      false,
    )
  })

  it('trata localmente a resposta proibida do backend', () => {
    const forbiddenError = Object.assign(new AxiosError(), {
      response: { status: 403 },
    })
    setHistoryQuery({ error: forbiddenError, isError: true })

    renderSection()

    expect(screen.getByText(
      'Sua conta não pode consultar o histórico de fichas adicionais.',
    )).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar novamente' }))
      .not.toBeInTheDocument()
  })

  it('apresenta o histórico sem atores, UUIDs ou ações futuras', () => {
    setHistoryQuery({
      data: {
        items: [{
          attachmentExists: true,
          attachmentPageCount: 4,
          completedAt: '2026-03-18T12:16:00Z',
          completedBy: { id: '019fb82d-2222-7222-8222-222222222222' },
          createdAt: '2026-03-15T21:42:00Z',
          createdBy: { id: '019fb82d-3333-7333-8333-333333333333' },
          id: '019fb82d-4444-7444-8444-444444444444',
          origin: 'PAPER_TRANSCRIPTION',
          signedOn: '2026-03-14',
          status: 'COMPLETED',
          version: 2,
        }],
        page: 0,
        totalElements: 1,
        totalPages: 1,
      },
    })

    renderSection()

    expect(screen.getByRole('heading', { name: 'Versão 2' }))
      .toBeInTheDocument()
    expect(screen.getByText('Concluída')).toBeInTheDocument()
    expect(screen.getByText('Transcrição de papel', { exact: false }))
      .toBeInTheDocument()
    expect(screen.getByText('Anexo com 4 páginas', { exact: false }))
      .toBeInTheDocument()
    expect(document.body).not.toHaveTextContent('019fb82d')
    expect(screen.queryByRole('button', { name: 'Nova ficha' }))
      .not.toBeInTheDocument()
    expect(screen.getByRole('link', {
      name: 'Abrir ficha adicional, versão 2',
    })).toBeInTheDocument()
  })

  it('mantém paginação própria e bloqueia os controles na atualização', async () => {
    const user = userEvent.setup()
    setHistoryQuery({
      data: {
        items: [{
          createdAt: '2026-07-29T21:42:00Z',
          id: 'form-id',
          origin: 'DIRECT_SYSTEM_ENTRY',
          status: 'DRAFT',
          version: 3,
        }],
        page: 0,
        totalElements: 12,
        totalPages: 2,
      },
    })
    const view = renderSection()

    await user.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(hookMocks.useOratorianoFormHistory).toHaveBeenLastCalledWith(
      '019fb82d-1111-7111-8111-111111111111',
      1,
      true,
    )

    setHistoryQuery({
      data: {
        items: [{
          createdAt: '2026-07-29T21:42:00Z',
          id: 'form-id',
          origin: 'DIRECT_SYSTEM_ENTRY',
          status: 'DRAFT',
          version: 3,
        }],
        page: 1,
        totalElements: 12,
        totalPages: 2,
      },
      isFetching: true,
    })
    view.rerender(
      <OratorianoFormsSection
        canView
        oratorianoId="019fb82d-1111-7111-8111-111111111111"
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Atualizando fichas adicionais…',
    )
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled()
  })

  it('oferece navegação explícita sem disparar leitura de detalhe', async () => {
    const user = userEvent.setup()
    setHistoryQuery({
      data: {
        items: [{
          createdAt: '2026-07-29T21:42:00Z',
          id: 'form-id',
          origin: 'DIRECT_SYSTEM_ENTRY',
          status: 'DRAFT',
          version: 3,
        }],
        page: 0,
        totalElements: 1,
        totalPages: 1,
      },
    })

    renderSection()
    const link = screen.getByRole('link', {
      name: 'Abrir ficha adicional, versão 3',
    })
    expect(link).toHaveAttribute(
      'data-to',
      '/manage/oratorios/oratorianos/$oratorianoId/fichas/$formId',
    )
    expect(link).toHaveAttribute('data-form-id', 'form-id')
    expect(link).toHaveAttribute(
      'data-oratoriano-id',
      '019fb82d-1111-7111-8111-111111111111',
    )

    await user.tab()
    expect(link).toHaveFocus()
    fireEvent.click(link)

    expect(hookMocks.useOratorianoFormHistory).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Abrir ficha')).toBeInTheDocument()
  })

  it('não oferece abertura quando o identificador da ficha está ausente', () => {
    setHistoryQuery({
      data: {
        items: [{
          createdAt: '2026-07-29T21:42:00Z',
          origin: 'DIRECT_SYSTEM_ENTRY',
          status: 'DRAFT',
          version: 3,
        }],
        page: 0,
        totalElements: 1,
        totalPages: 1,
      },
    })

    renderSection()

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(document.body).not.toHaveTextContent('undefined')
  })
})
