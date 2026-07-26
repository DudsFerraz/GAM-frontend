import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PresentSummary } from './PresentSummary'

describe('PresentSummary', () => {
  it('mantém o resumo completo e identifica cadastros historicamente restritos', () => {
    render(
      <PresentSummary
        isError={false}
        isLoading={false}
        onRetry={vi.fn()}
        summary={{
          members: [{
            id: 'member-attendance',
            person: {
              firstName: 'Maria',
              id: 'member-id',
              status: 'INACTIVE',
              surname: 'Silva',
            },
          }],
          oratorianos: [{
            id: 'oratoriano-attendance',
            person: {
              deleted: true,
              firstName: 'João',
              id: 'oratoriano-id',
              status: 'DELETED',
              surname: 'Souza',
            },
          }],
        }}
      />,
    )

    expect(screen.getByRole('button', {
      name: 'Abrir resumo com 2 pessoas presentes',
    })).toBeInTheDocument()
    expect(screen.getByText('Membro inativo')).toBeInTheDocument()
    expect(screen.getByText('Cadastro removido')).toBeInTheDocument()
  })

  it('não exibe contagens cacheadas quando o resumo falha', () => {
    render(
      <PresentSummary
        isError
        isLoading={false}
        onRetry={vi.fn()}
        summary={{
          members: [{
            id: 'cached-attendance',
            person: {
              firstName: 'Maria',
              id: 'member-id',
              surname: 'Silva',
            },
          }],
          oratorianos: [],
        }}
      />,
    )

    expect(screen.getByRole('button', {
      name: 'Abrir resumo de presentes indisponível',
    })).toBeInTheDocument()
    expect(screen.queryByText('Maria Silva')).not.toBeInTheDocument()
  })

  it('não apresenta zero pessoas enquanto o resumo está carregando', () => {
    render(
      <PresentSummary
        isError={false}
        isLoading
        onRetry={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', {
      name: 'Abrir resumo de presentes em carregamento',
    })).toHaveTextContent('Presentes: carregando...')
    expect(screen.queryByText('Presentes: 0')).not.toBeInTheDocument()
  })
})
