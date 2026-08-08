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
  {
    key: 'phoneNumber',
    label: 'Telefone',
    inputType: 'text',
    allowedOperators: ['LIKE'],
    sortable: false,
    validateValue: (value) => (
      typeof value === 'string' && value.replace(/\D/g, '').length >= 4
        ? undefined
        : 'Digite pelo menos 4 dígitos para pesquisar por telefone.'
    ),
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

  it('mantém um filtro avançado inválido local até a regra ser atendida', () => {
    const onSearch = vi.fn()

    render(
      <SearchAndFilter
        config={config}
        mainFilterField="name"
        onSearch={onSearch}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Campo do filtro' }), {
      target: { value: 'phoneNumber' },
    })

    const valueInput = screen.getByRole('textbox', { name: 'Valor do filtro' })
    fireEvent.change(valueInput, { target: { value: '19' } })
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar filtro' }))

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(
      'Digite pelo menos 4 dígitos para pesquisar por telefone.',
    )
    expect(valueInput).toHaveAttribute('aria-invalid', 'true')
    expect(valueInput).toHaveAttribute('aria-describedby', alert.id)
    expect(screen.queryByRole('button', { name: 'Remover filtro de Telefone' }))
      .not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(onSearch).not.toHaveBeenCalled()

    fireEvent.change(valueInput, { target: { value: '1999' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(valueInput).not.toHaveAttribute('aria-invalid', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar filtro' }))
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onSearch).toHaveBeenLastCalledWith(
      [{ field: 'phoneNumber', value: '1999', comparisonMethod: 'LIKE' }],
      [],
    )
  })

  it('não envia uma pesquisa rápida inválida e retoma após a correção', () => {
    const onSearch = vi.fn()
    const message = 'Digite no máximo 5 caracteres.'
    const mainConfig: FieldConfig[] = [{
      key: 'displayName',
      label: 'Nome de exibição',
      inputType: 'text',
      allowedOperators: ['LIKE'],
      filterable: false,
      sortable: false,
      validateValue: (value) => (
        typeof value === 'string' && value.trim().length <= 5
          ? undefined
          : message
      ),
    }]

    render(
      <SearchAndFilter
        config={mainConfig}
        mainFilterField="displayName"
        onSearch={onSearch}
      />,
    )

    const searchInput = screen.getByRole('searchbox', {
      name: 'Pesquisa rápida por Nome de exibição',
    })
    fireEvent.change(searchInput, { target: { value: 'Maria' } })
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(onSearch).toHaveBeenLastCalledWith(
      [{ field: 'displayName', value: 'Maria', comparisonMethod: 'LIKE' }],
      [],
    )

    fireEvent.change(searchInput, { target: { value: 'Mariana' } })
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(message)
    expect(searchInput).toHaveAttribute('aria-invalid', 'true')
    expect(searchInput).toHaveAttribute('aria-describedby', alert.id)
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(onSearch).toHaveBeenLastCalledWith([], [])

    fireEvent.change(searchInput, { target: { value: 'Mario' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(onSearch).toHaveBeenLastCalledWith(
      [{ field: 'displayName', value: 'Mario', comparisonMethod: 'LIKE' }],
      [],
    )
  })

  it('não repete a busca quando recebe uma configuração equivalente', () => {
    const onSearch = vi.fn()
    const { rerender } = render(
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
    expect(onSearch).toHaveBeenCalledTimes(1)

    rerender(
      <SearchAndFilter
        config={config.map((field) => ({ ...field }))}
        mainFilterField="name"
        onSearch={onSearch}
      />,
    )

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(onSearch).toHaveBeenCalledTimes(1)
  })
})
