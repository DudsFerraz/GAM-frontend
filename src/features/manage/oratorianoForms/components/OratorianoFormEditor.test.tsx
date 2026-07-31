import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OratorianoFormEditor } from './OratorianoFormEditor'
import type { ParsedOratorianoFormDetail } from '../parseFormDetail'

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  proceed: vi.fn(),
  reset: vi.fn(),
  useBlocker: vi.fn(),
  useReplaceOratorianoFormDraft: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  useBlocker: mocks.useBlocker,
}))

vi.mock('../hooks/useOratorianoForms', async (importOriginal) => {
  const original = await importOriginal<typeof import('../hooks/useOratorianoForms')>()
  return {
    ...original,
    useReplaceOratorianoFormDraft: mocks.useReplaceOratorianoFormDraft,
  }
})

function mutationState(overrides: Record<string, unknown> = {}) {
  return {
    error: null,
    isError: false,
    isPending: false,
    mutate: mocks.mutate,
    ...overrides,
  }
}

const detail = {
  createdAt: '2026-03-15T21:42:00Z',
  data: {
    firstName: 'Marina',
    surname: 'Alves',
  },
  draftRevision: 7,
  id: 'form-id',
  origin: 'DIRECT_SYSTEM_ENTRY',
  status: 'DRAFT',
  version: 3,
} satisfies ParsedOratorianoFormDetail

function renderEditor(detailValue = detail) {
  return render(
    <OratorianoFormEditor
      detail={detailValue}
      formId="form-id"
      name="Marina Alves"
      oratorianoId="oratoriano-id"
    />,
  )
}

beforeEach(() => {
  mocks.mutate.mockReset()
  mocks.proceed.mockReset()
  mocks.reset.mockReset()
  mocks.useBlocker.mockReset()
  mocks.useBlocker.mockReturnValue({ status: 'idle' })
  mocks.useReplaceOratorianoFormDraft.mockReset()
  mocks.useReplaceOratorianoFormDraft.mockReturnValue(mutationState())
})

describe('OratorianoFormEditor', () => {
  it('renderiza as cinco etapas no stepper horizontal aprovado', () => {
    renderEditor()

    const navigation = screen.getByRole('navigation', { name: 'Etapas da ficha' })
    expect(within(navigation).getAllByRole('button')).toHaveLength(5)
    expect(screen.getByRole('button', { name: /Etapa 1: Identificação/ }))
      .toHaveAttribute('aria-current', 'step')
    expect(screen.getByText('Etapa 1 de 5 · Identificação e endereço'))
      .toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salvar rascunho' }))
      .toBeInTheDocument()
  })

  it('navega por todas as áreas e preserva valores locais', async () => {
    const user = userEvent.setup()
    renderEditor()
    const name = screen.getByRole('textbox', { name: 'Nome' })
    await user.clear(name)
    await user.type(name, 'Mariana')

    await user.click(screen.getByRole('button', {
      name: /Etapa 2: Escola, responsável e família/,
    }))
    expect(screen.getByRole('heading', { name: 'Escola, responsável e família' }))
      .toHaveFocus()
    await user.click(screen.getByRole('button', {
      name: /Etapa 1: Identificação e endereço/,
    }))

    expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveValue('Mariana')
  })

  it('envia um payload integral com dados preservados de etapas distintas', async () => {
    const user = userEvent.setup()
    renderEditor()
    await user.type(screen.getByRole('textbox', { name: 'Telefone' }), '11988881212')
    await user.click(screen.getByRole('button', {
      name: /Etapa 2: Escola, responsável e família/,
    }))
    await user.type(screen.getByRole('textbox', { name: 'Escola' }), 'Escola Horizonte')
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))

    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledOnce())
    expect(mocks.mutate.mock.calls[0][0]).toMatchObject({
      firstName: 'Marina',
      phoneNumber: '+5511988881212',
      schoolName: 'Escola Horizonte',
      surname: 'Alves',
    })
  })

  it('mantém a etapa e limpa o dirty state somente após sucesso autoritativo', async () => {
    const user = userEvent.setup()
    mocks.useReplaceOratorianoFormDraft.mockReturnValue(mutationState({
      data: { draftRevision: 8 },
    }))
    mocks.mutate.mockImplementationOnce((payload, options) => {
      options.onSuccess({ ...detail, data: payload, draftRevision: 8 })
    })
    renderEditor()
    await user.click(screen.getByRole('button', {
      name: /Etapa 2: Escola, responsável e família/,
    }))
    await user.type(screen.getByRole('textbox', { name: 'Escola' }), 'Escola Horizonte')
    expect(screen.getByText('Alterações não salvas')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))

    expect(await screen.findByText('Rascunho salvo. Você continua na etapa 2.'))
      .toBeInTheDocument()
    expect(screen.queryByText('Alterações não salvas')).not.toBeInTheDocument()
    expect(screen.getByText(/revisão 8/)).toBeInTheDocument()
  })

  it('associa erros em português e não envia dados inválidos', async () => {
    const user = userEvent.setup()
    renderEditor()
    await user.type(screen.getByRole('textbox', { name: 'CPF' }), '11111111111')
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))

    expect(await screen.findByText('Informe um CPF válido com onze dígitos.'))
      .toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'CPF' }))
      .toHaveAttribute('aria-invalid', 'true')
    expect(mocks.mutate).not.toHaveBeenCalled()
  })

  it('preserva valores e dirty state quando o salvamento falha', async () => {
    const user = userEvent.setup()
    mocks.useReplaceOratorianoFormDraft.mockReturnValue(mutationState({
      error: new Error('payload privado'),
      isError: true,
    }))
    renderEditor()
    const name = screen.getByRole('textbox', { name: 'Nome' })
    await user.clear(name)
    await user.type(name, 'Mariana')

    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))

    expect(name).toHaveValue('Mariana')
    expect(screen.getByText('Alterações não salvas')).toBeInTheDocument()
    expect(screen.getByText(/Seus dados continuam nesta página/))
      .toBeInTheDocument()
    expect(document.body).not.toHaveTextContent('payload privado')
  })

  it('preserva valores locais e desabilita edição após mudança autoritativa de status', async () => {
    const user = userEvent.setup()
    const view = renderEditor()
    const name = screen.getByRole('textbox', { name: 'Nome' })
    await user.clear(name)
    await user.type(name, 'Mariana')

    view.rerender(
      <OratorianoFormEditor
        detail={{ ...detail, draftRevision: 8, status: 'COMPLETED' }}
        formId="form-id"
        name="Marina Alves"
        oratorianoId="oratoriano-id"
      />,
    )

    expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveValue('Mariana')
    expect(screen.getByRole('textbox', { name: 'Nome' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Edição encerrada' })).toBeDisabled()
    expect(screen.getByText(/valores locais continuam visíveis/)).toBeInTheDocument()
    expect(screen.getByText(/revisão 8/)).toBeInTheDocument()
  })

  it('ativa uma única proteção de saída somente quando há alterações', async () => {
    const user = userEvent.setup()
    renderEditor()
    expect(mocks.useBlocker).toHaveBeenLastCalledWith(expect.objectContaining({
      disabled: true,
    }))

    await user.type(screen.getByRole('textbox', { name: 'RG' }), '123')

    const blockerOptions = mocks.useBlocker.mock.calls.at(-1)?.[0]
    expect(blockerOptions.disabled).toBe(false)
    expect(blockerOptions.enableBeforeUnload()).toBe(true)
    expect(blockerOptions.shouldBlockFn()).toBe(true)
  })

  it('explica a saída e permite permanecer ou descartar', async () => {
    const user = userEvent.setup()
    mocks.useBlocker.mockReturnValue({
      proceed: mocks.proceed,
      reset: mocks.reset,
      status: 'blocked',
    })
    const view = renderEditor()

    expect(screen.getByText('Existem alterações não salvas.'))
      .toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Permanecer e revisar' }))
    expect(mocks.reset).toHaveBeenCalledOnce()

    view.unmount()
    renderEditor()
    await user.click(screen.getByRole('button', { name: 'Descartar e sair' }))
    expect(mocks.proceed).toHaveBeenCalledOnce()
  })

  it('não antecipa controles das próximas fatias', () => {
    renderEditor()
    for (const action of [
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
})
