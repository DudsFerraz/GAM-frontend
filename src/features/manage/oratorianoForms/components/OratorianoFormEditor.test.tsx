import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SafeHttpError } from '@/lib/http'

import { OratorianoFormEditor } from './OratorianoFormEditor'
import type { ParsedOratorianoFormDetail } from '../parseFormDetail'

const mocks = vi.hoisted(() => ({
  dirtyChange: vi.fn(),
  mutate: vi.fn(),
  exitBypassChange: vi.fn(),
  deleteOptions: {
    value: undefined as { onDeleted?: () => Promise<void> } | undefined,
  },
  useDeleteOratorianoFormDraft: vi.fn(),
  useReplaceOratorianoFormDraft: vi.fn(),
}))

vi.mock('../hooks/useOratorianoForms', async (importOriginal) => {
  const original = await importOriginal<typeof import('../hooks/useOratorianoForms')>()
  return {
    ...original,
    useDeleteOratorianoFormDraft: mocks.useDeleteOratorianoFormDraft,
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

const detail: ParsedOratorianoFormDetail = {
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
}

const completeIdentificationDetail: ParsedOratorianoFormDetail = {
  ...detail,
  data: {
    ...detail.data,
    address: {
      addressLine: 'Rua das Acácias',
      addressNumber: '120',
      cep: '01234-567',
      city: 'São Paulo',
      neighborhood: 'Centro',
    },
    birthDate: '2005-03-05',
    cpf: '52998224725',
    phoneNumber: '+5511988881212',
  },
}

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
  mocks.dirtyChange.mockReset()
  mocks.mutate.mockReset()
  mocks.exitBypassChange.mockReset()
  mocks.useDeleteOratorianoFormDraft.mockReset()
  mocks.deleteOptions.value = undefined
  mocks.useDeleteOratorianoFormDraft.mockImplementation((
    _oratorianoId,
    _formId,
    options,
  ) => {
    mocks.deleteOptions.value = options
    return mutationState()
  })
  mocks.useReplaceOratorianoFormDraft.mockReset()
  mocks.useReplaceOratorianoFormDraft.mockReturnValue(mutationState())
})

describe('OratorianoFormEditor', () => {
  it('oferece a exclusão somente para um rascunho editável', () => {
    renderEditor()

    expect(screen.getByRole('button', { name: 'Excluir rascunho' }))
      .toBeInTheDocument()
  })

  it('não mostra a exclusão quando a ficha deixa de ser editável', () => {
    renderEditor({ ...detail, status: 'COMPLETED' })

    expect(screen.queryByRole('button', { name: 'Excluir rascunho' }))
      .not.toBeInTheDocument()
  })

  it('comunica alterações e libera a saída antes da navegação pós-exclusão', async () => {
    const user = userEvent.setup()
    render(
      <OratorianoFormEditor
        detail={detail}
        formId="form-id"
        name="Marina Alves"
        onDirtyChange={mocks.dirtyChange}
        onExitBypassChange={mocks.exitBypassChange}
        oratorianoId="oratoriano-id"
      />,
    )
    await user.type(screen.getByRole('textbox', { name: 'RG' }), '123')

    expect(mocks.dirtyChange).toHaveBeenLastCalledWith(true)

    await mocks.deleteOptions.value?.onDeleted?.()

    expect(mocks.exitBypassChange).toHaveBeenLastCalledWith(true)
  })

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

  it('marca visualmente os campos obrigatórios', () => {
    renderEditor()

    expect(screen.getByText('Nome')).toHaveAttribute('data-required', 'true')
    expect(screen.getByText('CPF')).toHaveAttribute('data-required', 'true')
    expect(screen.getByText('RG')).not.toHaveAttribute('data-required')
  })

  it('mostra vermelho para CPF inválido sem bloquear o avanço', async () => {
    const user = userEvent.setup()
    renderEditor(completeIdentificationDetail)

    const cpf = screen.getByRole('textbox', { name: 'CPF' })
    await user.clear(cpf)
    await user.type(cpf, '12345678910')
    await user.click(screen.getByRole('button', { name: 'Avançar' }))

    expect(screen.getByRole('heading', { name: 'Escola, responsável e família' }))
      .toBeInTheDocument()
    expect(screen.getByRole('button', {
      name: /Etapa 1: Identificação e endereço, com campos inválidos/,
    })).toBeInTheDocument()
  })

  it('mantém etapas não iniciadas apagadas e mostra amarelo depois da visita', async () => {
    const user = userEvent.setup()
    renderEditor(completeIdentificationDetail)

    const stepTwo = screen.getByRole('button', {
      name: /Etapa 2: Escola, responsável e família, ainda não iniciada/,
    })
    expect(stepTwo).toBeInTheDocument()

    await user.click(stepTwo)

    expect(screen.getByRole('button', {
      name: /Etapa 2: Escola, responsável e família, com campos obrigatórios pendentes/,
    })).toBeInTheDocument()
    expect(screen.getByRole('button', {
      name: /Etapa 5: Revisão e salvamento, ainda não iniciada/,
    })).toBeInTheDocument()
  })

  it('troca o estado inválido por concluído depois da correção', async () => {
    const user = userEvent.setup()
    renderEditor(completeIdentificationDetail)
    const cpf = screen.getByRole('textbox', { name: 'CPF' })

    await user.type(cpf, '12345678910')
    expect(screen.getByRole('button', {
      name: /Etapa 1: Identificação e endereço, com campos inválidos/,
    })).toBeInTheDocument()

    await user.clear(cpf)
    await user.type(cpf, '52998224725')

    expect(screen.getByRole('button', {
      name: /Etapa 1: Identificação e endereço, concluída/,
    })).toBeInTheDocument()
  })

  it('navega por todas as áreas e preserva valores locais', async () => {
    const user = userEvent.setup()
    renderEditor(completeIdentificationDetail)
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
    renderEditor(completeIdentificationDetail)
    const phone = screen.getByRole('textbox', { name: 'Telefone' })
    await user.clear(phone)
    await user.type(phone, '11988881212')
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

  it('salva rascunho incompleto com os dados válidos já informados', async () => {
    const user = userEvent.setup()
    renderEditor()
    await user.type(screen.getByRole('textbox', { name: 'CPF' }), '52998224725')
    await user.type(screen.getByRole('textbox', { name: 'Telefone' }), '11988881212')
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))

    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledOnce())
    expect(mocks.mutate.mock.calls[0][0]).toMatchObject({
      cpf: '52998224725',
      firstName: 'Marina',
      phoneNumber: '+5511988881212',
      surname: 'Alves',
    })
    expect(mocks.mutate.mock.calls[0][0].schoolName).toBeUndefined()
    expect(mocks.mutate.mock.calls[0][0].health).toBeUndefined()
  })

  it('bloqueia avanço quando falta campo obrigatório', async () => {
    const user = userEvent.setup()
    renderEditor()

    await user.click(screen.getByRole('button', { name: 'Avançar' }))

    expect(screen.getByRole('heading', { name: 'Identificação e endereço' }))
      .toBeInTheDocument()
    expect(screen.getAllByText('Preencha este campo.').length).toBeGreaterThan(0)
  })

  it('marca etapa incompleta depois de iniciar e voltar sem validar o retorno', async () => {
    const user = userEvent.setup()
    renderEditor(completeIdentificationDetail)

    await user.click(screen.getByRole('button', {
      name: /Etapa 2: Escola, responsável e família, ainda não iniciada/,
    }))
    expect(screen.getByRole('heading', { name: 'Escola, responsável e família' }))
      .toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Voltar' }))

    expect(screen.getByRole('heading', { name: 'Identificação e endereço' }))
      .toBeInTheDocument()
    expect(screen.getByRole('button', {
      name: /Etapa 2: Escola, responsável e família, com campos obrigatórios pendentes/,
    })).toBeInTheDocument()
  })

  it('mantém a etapa e limpa o dirty state somente após sucesso autoritativo', async () => {
    const user = userEvent.setup()
    mocks.useReplaceOratorianoFormDraft.mockReturnValue(mutationState({
      data: { draftRevision: 8 },
    }))
    mocks.mutate.mockImplementationOnce((payload, options) => {
      options.onSuccess({ ...detail, data: payload, draftRevision: 8 })
    })
    renderEditor(completeIdentificationDetail)
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

  it('explica quando os dados preenchidos precisam ser corrigidos para salvar', async () => {
    const user = userEvent.setup()
    mocks.useReplaceOratorianoFormDraft.mockReturnValue(mutationState({
      error: new SafeHttpError(400, 'INVALID_REQUEST'),
      isError: true,
    }))
    renderEditor()

    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))

    expect(await screen.findByText(/O rascunho pode ser salvo mesmo incompleto/))
      .toBeInTheDocument()
    expect(screen.getByText(/valores preenchidos precisam estar em formato válido/))
      .toBeInTheDocument()
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

  it('comunica o estado dirty somente depois de uma alteração', async () => {
    const user = userEvent.setup()
    render(
      <OratorianoFormEditor
        detail={detail}
        formId="form-id"
        name="Marina Alves"
        onDirtyChange={mocks.dirtyChange}
        oratorianoId="oratoriano-id"
      />,
    )
    expect(mocks.dirtyChange).toHaveBeenLastCalledWith(false)

    await user.type(screen.getByRole('textbox', { name: 'RG' }), '123')

    expect(mocks.dirtyChange).toHaveBeenLastCalledWith(true)
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
