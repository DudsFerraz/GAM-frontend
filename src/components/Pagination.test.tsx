import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Pagination } from './Pagination'

const defaultProps = {
  itemLabel: 'membros',
  onPageChange: vi.fn(),
  page: 1,
  totalElements: 25,
  totalPages: 3,
}

describe('Pagination', () => {
  it('não ocupa espaço quando só existe uma página', () => {
    const { container } = render(
      <Pagination {...defaultProps} page={0} totalPages={1} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('expõe o resumo e a navegação com nomes acessíveis', () => {
    render(<Pagination {...defaultProps} />)

    expect(screen.getByRole('navigation', { name: 'Paginação de membros' })).toHaveTextContent(
      'Página 2 de 3 · 25 membros',
    )
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeEnabled()
  })

  it('solicita as páginas anterior e seguinte', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />)

    await user.click(screen.getByRole('button', { name: 'Anterior' }))
    await user.click(screen.getByRole('button', { name: 'Próxima' }))

    expect(onPageChange).toHaveBeenNthCalledWith(1, 0)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 2)
  })

  it('bloqueia os limites e respeita o estado desabilitado', () => {
    const { rerender } = render(<Pagination {...defaultProps} page={0} />)
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()

    rerender(<Pagination {...defaultProps} page={2} />)
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled()

    rerender(<Pagination {...defaultProps} disabled />)
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled()
  })
})
