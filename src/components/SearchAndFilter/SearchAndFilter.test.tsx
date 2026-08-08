import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SearchAndFilter } from './SearchAndFilter'
import type { FieldConfig } from './types'

const config: FieldConfig[] = [
  {
    key: 'name',
    label: 'Nome',
    inputType: 'text',
    allowedOperators: ['LIKE'],
    sortable: false,
  },
  {
    key: 'status',
    label: 'Situação',
    inputType: 'select',
    options: [
      { label: 'Ativos', value: ['ACTIVE'] },
      { label: 'Ativos e inativos', value: ['ACTIVE', 'INACTIVE'] },
    ],
    allowedOperators: ['IN'],
    sortable: true,
  },
]

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('SearchAndFilter', () => {
  it('aplica pesquisa rápida com filtros e ordenação após o debounce', async () => {
    const onSearch = vi.fn()

    render(
      <SearchAndFilter
        config={config}
        mainFilterField="name"
        onSearch={onSearch}
      />,
    )

    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Pesquisa rápida por Nome' }),
      { target: { value: 'Maria' } },
    )
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onSearch).toHaveBeenLastCalledWith(
      [{ field: 'name', value: 'Maria', comparisonMethod: 'LIKE' }],
      [],
    )

    fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Campo do filtro' }), {
      target: { value: 'status' },
    })
    fireEvent.change(
      screen.getByRole('combobox', { name: 'Valor do filtro' }),
      { target: { value: JSON.stringify(['ACTIVE', 'INACTIVE']) } },
    )
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar filtro' }))

    const activeFilter = screen.getByRole('button', {
      name: 'Remover filtro de Situação',
    }).parentElement
    expect(activeFilter).toHaveTextContent('Ativos e inativos')
    expect(activeFilter).not.toHaveTextContent('Valor não disponível')

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onSearch).toHaveBeenLastCalledWith(
      [
        { field: 'status', value: ['ACTIVE', 'INACTIVE'], comparisonMethod: 'IN' },
        { field: 'name', value: 'Maria', comparisonMethod: 'LIKE' },
      ],
      [],
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ordenar' }))
    fireEvent.click(screen.getByRole('button', { name: /Situação/ }))
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onSearch).toHaveBeenLastCalledWith(
      [
        { field: 'status', value: ['ACTIVE', 'INACTIVE'], comparisonMethod: 'IN' },
        { field: 'name', value: 'Maria', comparisonMethod: 'LIKE' },
      ],
      [{ field: 'status', direction: 'ASC' }],
    )

    fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }))
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(screen.getByRole('searchbox', { name: 'Pesquisa rápida por Nome' }))
      .toHaveValue('')
    expect(onSearch).toHaveBeenLastCalledWith(
      [{
        field: 'status',
        value: ['ACTIVE', 'INACTIVE'],
        comparisonMethod: 'IN',
      }],
      [{ field: 'status', direction: 'ASC' }],
    )
  })

  it('omite ações sem campos aplicáveis e não renderiza o toggle de situação', () => {
    render(
      <SearchAndFilter
        config={[{
          key: 'name',
          label: 'Nome',
          inputType: 'text',
          filterable: false,
          sortable: false,
        }]}
        mainFilterField="name"
        onSearch={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Filtrar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ordenar' })).not.toBeInTheDocument()
    expect(screen.queryByText('Apenas ativos')).not.toBeInTheDocument()
  })
})
