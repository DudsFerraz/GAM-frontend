import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CreateOratorianoFormDialog } from './CreateOratorianoFormDialog'

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  navigate: vi.fn(),
  reset: vi.fn(),
  useCreateOratorianoForm: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mocks.navigate,
}))

vi.mock('../hooks/useOratorianoForms', () => ({
  useCreateOratorianoForm: mocks.useCreateOratorianoForm,
}))

function mutationState(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    error: null,
    isError: false,
    isPending: false,
    isSuccess: false,
    mutate: mocks.mutate,
    reset: mocks.reset,
    ...overrides,
  }
}

beforeEach(() => {
  mocks.mutate.mockReset()
  mocks.navigate.mockReset()
  mocks.reset.mockReset()
  mocks.useCreateOratorianoForm.mockReset()
  mocks.useCreateOratorianoForm.mockReturnValue(mutationState())
})

describe('CreateOratorianoFormDialog', () => {
  it('exige a origem com mensagem explícita em português', async () => {
    const user = userEvent.setup()
    render(
      <CreateOratorianoFormDialog
        onOpenChange={vi.fn()}
        open
        oratorianoId="oratoriano-id"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }))

    expect(await screen.findByText('Escolha como esta ficha será preenchida.'))
      .toBeInTheDocument()
    expect(mocks.mutate).not.toHaveBeenCalled()
  })

  it('envia a opção business-facing e navega com a resposta autoritativa', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    mocks.mutate.mockImplementationOnce((origin, options) => {
      expect(origin).toBe('DIRECT_SYSTEM_ENTRY')
      options.onSuccess({ data: {}, id: 'form-id', status: 'DRAFT' })
    })
    render(
      <CreateOratorianoFormDialog
        onOpenChange={onOpenChange}
        open
        oratorianoId="oratoriano-id"
      />,
    )

    await user.click(screen.getByRole('radio', {
      name: /Preenchimento direto no sistema/,
    }))
    await user.dblClick(screen.getByRole('button', { name: 'Criar rascunho' }))

    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledOnce())
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(mocks.navigate).toHaveBeenCalledWith({
      params: { formId: 'form-id', oratorianoId: 'oratoriano-id' },
      to: '/manage/oratorios/oratorianos/$oratorianoId/fichas/$formId',
    })
  })

  it('mantém seleção e diálogo em erro seguro', () => {
    mocks.useCreateOratorianoForm.mockReturnValue(mutationState({
      error: new Error('payload privado'),
      isError: true,
    }))
    render(
      <CreateOratorianoFormDialog
        onOpenChange={vi.fn()}
        open
        oratorianoId="oratoriano-id"
      />,
    )

    expect(screen.getByText('Não foi possível criar a ficha.'))
      .toBeInTheDocument()
    expect(document.body).not.toHaveTextContent('payload privado')
  })

  it('bloqueia controles enquanto a criação está pendente', () => {
    mocks.useCreateOratorianoForm.mockReturnValue(mutationState({ isPending: true }))
    render(
      <CreateOratorianoFormDialog
        onOpenChange={vi.fn()}
        open
        oratorianoId="oratoriano-id"
      />,
    )

    expect(screen.getByRole('button', { name: 'Criando rascunho…' }))
      .toBeDisabled()
    expect(screen.getAllByRole('radio').every((radio) => radio.hasAttribute('disabled')))
      .toBe(true)
  })
})
