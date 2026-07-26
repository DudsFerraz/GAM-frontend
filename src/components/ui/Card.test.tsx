import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Card, CardActionArea, CardContent } from './Card'

describe('CardActionArea', () => {
  it('oferece uma ação primária acessível por clique e teclado', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Card interactive>
        <CardActionArea
          aria-label="Ver detalhes do evento"
          onClick={onClick}
        />
        <CardContent>Evento de exemplo</CardContent>
      </Card>,
    )

    const action = screen.getByRole('button', {
      name: 'Ver detalhes do evento',
    })
    expect(action).toHaveAttribute('type', 'button')

    action.focus()
    await user.keyboard('{Enter}')

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('aceita um link como ação principal de navegação', () => {
    render(
      <Card interactive>
        <CardActionArea asChild>
          <a aria-label="Abrir evento" href="/manage/events/evento-1" />
        </CardActionArea>
        <CardContent>Evento de exemplo</CardContent>
      </Card>,
    )

    expect(screen.getByRole('link', { name: 'Abrir evento' })).toHaveAttribute(
      'href',
      '/manage/events/evento-1',
    )
  })
})
