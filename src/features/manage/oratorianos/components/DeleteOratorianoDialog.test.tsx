import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DeleteOratorianoDialog } from './DeleteOratorianoDialog'

const hookMocks = vi.hoisted(() => ({
  useDeleteOratoriano: vi.fn(),
}))

const mutationMocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  reset: vi.fn(),
}))

vi.mock('../hooks/useOratorianos', () => hookMocks)

beforeEach(() => {
  mutationMocks.mutate.mockReset()
  mutationMocks.reset.mockReset()
  hookMocks.useDeleteOratoriano.mockReset()
  hookMocks.useDeleteOratoriano.mockReturnValue({
    error: null,
    isError: false,
    isPending: false,
    mutate: mutationMocks.mutate,
    reset: mutationMocks.reset,
  })
})

function renderDialog({
  onDeleted = vi.fn(),
  onOpenChange = vi.fn(),
}: {
  onDeleted?: () => void
  onOpenChange?: (open: boolean) => void
} = {}) {
  render(
    <DeleteOratorianoDialog
      name="Ana Souza"
      onDeleted={onDeleted}
      onOpenChange={onOpenChange}
      open
      oratorianoId="oratoriano-id"
    />,
  )

  return { onDeleted, onOpenChange }
}

describe('DeleteOratorianoDialog', () => {
  it('explica as consequências sem oferecer restauração e foca o motivo', async () => {
    renderDialog()

    expect(
      screen.getByRole('heading', {
        name: 'Excluir cadastro de Ana Souza?',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('As presenças anteriores permanecerão no histórico.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Rascunhos de fichas, PDFs e anexos serão excluídos em conjunto.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText(/restaur/i)).not.toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.getByRole('textbox', { name: 'Motivo da exclusão' }),
      ).toHaveFocus(),
    )
  })

  it('exige motivo e respeita o limite antes do envio', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Excluir cadastro' }),
    )
    expect(
      await screen.findByText('Informe o motivo da exclusão.'),
    ).toBeInTheDocument()

    fireEvent.change(
      screen.getByRole('textbox', { name: 'Motivo da exclusão' }),
      { target: { value: 'a'.repeat(2001) } },
    )
    await user.click(
      screen.getByRole('button', { name: 'Excluir cadastro' }),
    )
    expect(
      await screen.findByText(
        'O motivo deve ter no máximo 2.000 caracteres.',
      ),
    ).toBeInTheDocument()
    expect(mutationMocks.mutate).not.toHaveBeenCalled()
  })

  it('envia o motivo normalizado e conclui somente após sucesso', async () => {
    mutationMocks.mutate.mockImplementation(
      (
        _variables: unknown,
        options: { onSuccess: () => void },
      ) => options.onSuccess(),
    )
    const user = userEvent.setup()
    const { onDeleted, onOpenChange } = renderDialog()

    await user.type(
      screen.getByRole('textbox', { name: 'Motivo da exclusão' }),
      '  Cadastro duplicado.  ',
    )
    await user.click(
      screen.getByRole('button', { name: 'Excluir cadastro' }),
    )

    expect(mutationMocks.mutate).toHaveBeenCalledWith(
      {
        oratorianoId: 'oratoriano-id',
        reason: 'Cadastro duplicado.',
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onDeleted).toHaveBeenCalledOnce()
  })

  it('mantém feedback seguro disponível quando a exclusão falha', () => {
    hookMocks.useDeleteOratoriano.mockReturnValue({
      error: new Error('detalhe técnico confidencial'),
      isError: true,
      isPending: false,
      mutate: mutationMocks.mutate,
      reset: mutationMocks.reset,
    })

    renderDialog()

    expect(
      screen.getByText('Não foi possível excluir o cadastro.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Ocorreu um erro inesperado. Tente novamente.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('detalhe técnico confidencial'),
    ).not.toBeInTheDocument()
  })
})
