import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { DeleteOratorianoFormDialog } from './DeleteOratorianoFormDialog'

function renderDialog(overrides: Record<string, unknown> = {}) {
  const onDelete = vi.fn()
  const onOpenChange = vi.fn()
  const onReset = vi.fn()

  const view = render(
    <DeleteOratorianoFormDialog
      canOpen
      error={null}
      isPending={false}
      name="Marina Alves"
      onDelete={onDelete}
      onOpenChange={onOpenChange}
      onReset={onReset}
      open
      {...overrides}
    />,
  )

  return { onDelete, onOpenChange, onReset, ...view }
}

function ControlledDialog({
  onDelete,
}: {
  onDelete: (payload: unknown) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <DeleteOratorianoFormDialog
      canOpen
      error={null}
      isPending={false}
      name="Marina Alves"
      onDelete={onDelete}
      onOpenChange={setOpen}
      onReset={vi.fn()}
      open={open}
    />
  )
}

describe('DeleteOratorianoFormDialog', () => {
  it('apresenta consequências e foca o motivo ao abrir', async () => {
    renderDialog()

    expect(screen.getByText(
      'O rascunho deixará de ficar disponível. PDFs e anexos associados também deixarão de ter acesso ordinário.',
    )).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Motivo da exclusão' }))
      .toHaveFocus()
    expect(screen.getByText('0 de 2.000 caracteres')).toBeInTheDocument()
    expect(screen.queryByText('019')).not.toBeInTheDocument()
  })

  it('exige motivo, normaliza o valor e preserva foco ao cancelar', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<ControlledDialog onDelete={onDelete} />)

    const trigger = screen.getByRole('button', { name: 'Excluir rascunho' })
    await user.click(trigger)
    const dialog = screen.getByRole('dialog')
    const reason = within(dialog).getByRole('textbox', {
      name: 'Motivo da exclusão',
    })
    await user.type(reason, '   ')
    await user.click(within(dialog).getByRole('button', {
      name: 'Excluir rascunho',
    }))

    expect(screen.getByText('Informe o motivo da exclusão.'))
      .toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(trigger).toHaveFocus()
  })

  it('envia o motivo normalizado e mantém o diálogo aberto em erro', async () => {
    const user = userEvent.setup()
    const view = renderDialog()
    const { onDelete } = view
    const dialog = screen.getByRole('dialog')
    const reason = within(dialog).getByRole('textbox', {
      name: 'Motivo da exclusão',
    })
    await user.type(reason, '  Ficha duplicada.  ')
    await user.click(within(dialog).getByRole('button', {
      name: 'Excluir rascunho',
    }))

    expect(onDelete).toHaveBeenCalledWith({ reason: 'Ficha duplicada.' })
    expect(within(dialog).getByRole('textbox', { name: 'Motivo da exclusão' }))
      .toHaveValue('  Ficha duplicada.  ')

    view.rerender(
      <DeleteOratorianoFormDialog
        canOpen
        error={new Error('diagnóstico privado')}
        isPending={false}
        name="Marina Alves"
        onDelete={onDelete}
        onOpenChange={vi.fn()}
        onReset={vi.fn()}
        open
      />,
    )

    expect(within(screen.getByRole('dialog')).getByText(
      'Não foi possível excluir o rascunho.',
    ))
      .toBeInTheDocument()
    expect(screen.queryByText('diagnóstico privado')).not.toBeInTheDocument()
    expect(within(screen.getByRole('dialog')).getByRole('textbox', {
      name: 'Motivo da exclusão',
    }))
      .toHaveValue('  Ficha duplicada.  ')
  })

  it('bloqueia fechamento e submissão incompatível enquanto está pendente', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const onOpenChange = vi.fn()
    renderDialog({ isPending: true, onDelete, onOpenChange })

    expect(screen.getByRole('button', { name: 'Excluindo rascunho…' }))
      .toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Confirmando a exclusão do rascunho…',
    )

    await user.keyboard('{Escape}')
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it('não renderiza a ação em estados imutáveis ou sem condição de abertura', () => {
    const { rerender } = renderDialog({ canOpen: false, open: false })
    expect(screen.queryByRole('button', { name: 'Excluir rascunho' }))
      .not.toBeInTheDocument()

    rerender(
      <DeleteOratorianoFormDialog
        canOpen={false}
        error={null}
        isPending={false}
        name="Marina Alves"
        onDelete={vi.fn()}
        onOpenChange={vi.fn()}
        onReset={vi.fn()}
        open={false}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Excluir rascunho' }))
      .not.toBeInTheDocument()
  })
})
