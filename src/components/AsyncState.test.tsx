import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EmptyState, ErrorState, ForbiddenState, LoadingState } from './AsyncState'

describe('AsyncState', () => {
  it('anuncia o carregamento de forma acessível', () => {
    render(<LoadingState />)

    expect(screen.getByRole('status')).toHaveTextContent('Carregando...')
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })

  it('oferece uma tentativa novamente quando há callback', async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup()
    render(<ErrorState onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os dados.',
    )
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('não mostra uma ação de repetição sem callback', () => {
    render(<ErrorState />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('apresenta estados vazio e proibido com linguagem de negócio', () => {
    const { rerender } = render(<EmptyState />)
    expect(screen.getByText('Nenhum resultado encontrado.')).toBeInTheDocument()

    rerender(<ForbiddenState />)
    expect(screen.getByRole('alert')).toHaveTextContent('Acesso não autorizado.')
    expect(screen.getByRole('alert')).not.toHaveTextContent('MEMBER_MANAGE')
  })
})
